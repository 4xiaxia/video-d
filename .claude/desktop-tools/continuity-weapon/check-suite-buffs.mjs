import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(root, '..', '..', '..');
const manifestPath = join(root, 'suite-buff.manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const configPath = resolve(process.env.CONTINUITY_STACK_CONFIG || join(projectRoot, 'scripts', 'continuity-stack.config.json'));
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};

const suites = Array.isArray(manifest.suites) ? manifest.suites : [];
const byId = new Map(suites.map((suite) => [suite.id, suite]));
const failures = [];
const warnings = [];

for (const id of manifest.requiredIds || []) {
  if (!byId.has(id)) failures.push(`missing required suite: ${id}`);
}

for (const suite of suites) {
  for (const field of ['id', 'layer', 'source', 'purpose', 'boundary', 'activation', 'defaultAction']) {
    if (!suite[field]) failures.push(`${suite.id || '<unknown>'}: missing ${field}`);
  }
}

const duplicates = suites
  .map((suite) => suite.id)
  .filter((id, index, ids) => id && ids.indexOf(id) !== index);
for (const id of new Set(duplicates)) failures.push(`duplicate suite id: ${id}`);

for (const item of config.requiredPaths || []) {
  const path = resolveConfigPath(item.path || '');
  if (!existsSync(path)) failures.push(`missing required path: ${item.name || item.path}`);
}

for (const item of config.requiredCommands || []) {
  const status = checkCommand(item);
  if (!status.ok) failures.push(`required command not ready: ${status.command}${status.detail ? ` (${status.detail})` : ''}`);
}

for (const item of config.optionalCommands || []) {
  const status = checkCommand(item);
  if (!status.ok) warnings.push(`optional command not ready: ${status.command}${status.detail ? ` (${status.detail})` : ''}`);
}

if (failures.length > 0) {
  console.error('Suite buff manifest check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  for (const warning of warnings) console.error(`- warning: ${warning}`);
  process.exit(1);
}

for (const warning of warnings) console.warn(`Suite buff warning: ${warning}`);
console.log(`Suite buff manifest check passed: ${suites.length} suite(s).`);

function checkCommand(item) {
  const command = typeof item === 'string' ? item : item.command;
  if (!command) return { command: '', ok: false };
  if (!hasCommand(command)) return { command, ok: false, detail: 'not on PATH' };
  const args = Array.isArray(item.args) ? item.args : [];
  if (args.length === 0) return { command, ok: true };
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
  };
}

function hasCommand(command) {
  const lookup = process.platform === 'win32' ? 'where.exe' : 'command';
  const args = process.platform === 'win32' ? [command] : ['-v', command];
  const result = spawnSync(lookup, args, { encoding: 'utf8', stdio: 'pipe', shell: process.platform !== 'win32' });
  return result.status === 0;
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
