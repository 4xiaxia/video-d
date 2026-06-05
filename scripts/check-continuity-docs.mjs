import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredDocs = [
  ['AGENTS.md', ['SessionStart', '完成工作单元', 'Stop Hook']],
  ['PROJECT_STATE.md', ['## 基本信息', '## 下一步（接力棒）']],
  ['ENGINEERING_LOG.md', ['## 工作单元 #', '### 接力棒（下一个单元从这里开始）']],
  ['DECISIONS.md', ['# Decisions']],
  ['ARCHITECTURE.md', ['## 当前主流程', '## 文档与连续性架构']],
  ['KNOWN_ISSUES.md', ['# Known Issues']],
  ['PROJECT_TREE.md', ['# Project Tree', 'src/']],
  ['CHANGE_TREE变更树.md', ['# Change Tree']],
];

const failures = [];

for (const [file, needles] of requiredDocs) {
  let text = '';
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch (error) {
    failures.push(`${file}: missing (${error.code ?? error.message})`);
    continue;
  }

  for (const needle of needles) {
    if (!text.includes(needle)) {
      failures.push(`${file}: missing marker "${needle}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('Continuity docs check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Continuity docs check passed.');
