import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const defaultProjectDocs = [
  'AGENTS.md',
  'PROJECT_STATE.md',
  'ENGINEERING_LOG.md',
  'DECISIONS.md',
  'ARCHITECTURE.md',
  'KNOWN_ISSUES.md',
  'PROJECT_TREE.md',
];

const configPath = resolve(process.env.CONTINUITY_STACK_CONFIG || join(projectRoot, 'scripts', 'continuity-stack.config.json'));
const config = readConfig(configPath);
const localStack = Array.isArray(config.requiredPaths) ? config.requiredPaths : [];
const projectDocs = Array.isArray(config.projectDocs) ? config.projectDocs : defaultProjectDocs;
const requiredCommands = Array.isArray(config.requiredCommands) ? config.requiredCommands : [];
const optionalCommands = Array.isArray(config.optionalCommands) ? config.optionalCommands : [];

const missingStack = localStack.filter((item) => item && item.path && !existsSync(resolveConfigPath(item.path)));
const missingDocs = projectDocs.filter((file) => !existsSync(join(projectRoot, file)));
const requiredCommandStatus = requiredCommands.map(checkCommand).filter((item) => item.command);
const optionalCommandStatus = optionalCommands.map(checkCommand).filter((item) => item.command);
const missingRequiredCommands = requiredCommandStatus.filter((item) => !item.ok);

console.log('Local order audit');
console.log(`Project: ${projectRoot}`);
console.log(`Config: ${existsSync(configPath) ? configPath : 'none (portable defaults)'}`);
console.log('');
console.log('Configured local stack:');
if (localStack.length === 0) {
  console.log('- none configured');
} else {
  for (const item of localStack) {
    const resolvedPath = resolveConfigPath(item.path || '');
    console.log(`- ${existsSync(resolvedPath) ? 'OK' : 'MISSING'} ${item.name || item.path}: ${item.path}`);
  }
}

console.log('');
console.log('Project continuity docs:');
for (const file of projectDocs) {
  console.log(`- ${existsSync(join(projectRoot, file)) ? 'OK' : 'MISSING'} ${file}`);
}

console.log('');
console.log('Required commands:');
if (requiredCommandStatus.length === 0) {
  console.log('- none configured');
}
for (const item of requiredCommandStatus) {
  console.log(`- ${item.ok ? 'OK' : 'MISSING'} ${item.command}${item.detail ? ` (${item.detail})` : ''}`);
}

console.log('');
console.log('Optional external adapters:');
if (optionalCommandStatus.length === 0) {
  console.log('- none configured');
}
for (const item of optionalCommandStatus) {
  console.log(`- ${item.ok ? 'FOUND' : 'NOT READY'} ${item.command}${item.detail ? ` (${item.detail})` : ''}`);
  if (!item.ok && item.installHint) console.log(`  hint: ${item.installHint}`);
}

if (missingStack.length > 0 || missingDocs.length > 0 || missingRequiredCommands.length > 0) {
  console.log('');
  console.log('Audit result: NEEDS ORDERING');
  if (missingStack.length > 0) console.log(`Missing local stack items: ${missingStack.map((item) => item.name || item.path).join(', ')}`);
  if (missingDocs.length > 0) console.log(`Missing project docs: ${missingDocs.join(', ')}`);
  if (missingRequiredCommands.length > 0) console.log(`Missing required commands: ${missingRequiredCommands.map((item) => item.command).join(', ')}`);
  process.exit(1);
}

console.log('');
console.log('Audit result: ORDERED');

function hasCommand(command) {
  if (!command) return false;
  const lookup = process.platform === 'win32' ? 'where.exe' : 'command';
  const args = process.platform === 'win32' ? [command] : ['-v', command];
  const result = spawnSync(lookup, args, { encoding: 'utf8', stdio: 'pipe', shell: process.platform !== 'win32' });
  return result.status === 0;
}

function checkCommand(item) {
  const command = typeof item === 'string' ? item : item.command;
  if (!command) return { command: '', ok: false };
  if (!hasCommand(command)) {
    return { command, ok: false, detail: 'not on PATH', installHint: item.installHint };
  }
  const args = Array.isArray(item.args) ? item.args : [];
  if (args.length === 0) return { command, ok: true, installHint: item.installHint };
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    shell: process.platform === 'win32',
    timeout: Number(item.timeoutMs || 15000),
  });
  return {
    command,
    ok: result.status === 0,
    detail: result.status === 0 ? 'smoke passed' : summarizeFailure(result),
    installHint: item.installHint,
  };
}

function readConfig(path) {
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Invalid continuity stack config: ${path}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function resolveVars(value) {
  return String(value)
    .replace(/\$\{HOME\}/g, process.env.HOME || process.env.USERPROFILE || '')
    .replace(/\$\{USERPROFILE\}/g, process.env.USERPROFILE || process.env.HOME || '')
    .replace(/\$\{CODEX_HOME\}/g, process.env.CODEX_HOME || join(process.env.USERPROFILE || process.env.HOME || '', '.codex'))
    .replace(/\$\{CLAUDE_HOME\}/g, process.env.CLAUDE_HOME || join(process.env.USERPROFILE || process.env.HOME || '', '.claude'));
}

function resolveConfigPath(value) {
  const resolved = resolveVars(value);
  return isAbsolute(resolved) ? resolved : join(projectRoot, resolved);
}

function summarizeFailure(result) {
  const text = `${result.stderr || ''}${result.stdout || ''}`.replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, 120) : `exit ${result.status}`;
}
