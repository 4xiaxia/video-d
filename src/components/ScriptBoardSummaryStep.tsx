// @cleanroom-component: ScriptBoardSummaryStep
// @domain: script-agent-interface
// @slot: left-sider/script-board-summary-step
// @depends: TeachingProject.assets(scriptText/boardLayout), onOpenScriptAgent
// @feature-branch: script-agent-interface
// @feature-branch: script-board-combined-output
// ID: cleanroom-assets-script-board-step-001
// @io-input: scriptTextAsset, boardLayoutAsset, onOpenScriptAgent
// @io-output: onOpenScriptAgent()
// @route: left-sider/assets/script-board
// @fields: TeachingProject.assets(kind=scriptText), TeachingProject.assets(kind=boardLayout)
// @boundary: workflow step summary only; real editing stays in ScriptAgentWorkspace Drawer

import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import type { TeachingAsset } from '../domain/teachingProject';

const { Text, Title } = Typography;

export function ScriptBoardSummaryStep({
  boardLayoutAsset,
  canOpenAgent,
  onOpenScriptAgent,
  onGenerateScriptAgent,
  scriptTextAsset,
}: {
  boardLayoutAsset: TeachingAsset | undefined;
  canOpenAgent: boolean;
  onOpenScriptAgent: () => void;
  onGenerateScriptAgent: () => void;
  scriptTextAsset: TeachingAsset | undefined;
}) {
  const isScriptReady = scriptTextAsset?.status === 'ready' && Boolean(scriptTextAsset.summary.trim());
  const isBoardReady = boardLayoutAsset?.status === 'ready' && Boolean(boardLayoutAsset.summary.trim());
  const isReady = isScriptReady && isBoardReady;

  return (
    <div className="script-board-summary-step">
      <Card size="small">
        <Flex align="center" justify="space-between" gap={12}>
          <Space>
            <FileTextOutlined />
            <div>
              <Title level={5}>文稿与 C 素材</Title>
              <Text type="secondary">{isReady ? '已确认，下一步生成 A 轨。' : '在 Agent 中生成和确认。'}</Text>
            </div>
          </Space>
          <Space>
            <Button disabled={!canOpenAgent} icon={<EditOutlined />} onClick={onOpenScriptAgent}>
              打开查看
            </Button>
            <Button disabled={!canOpenAgent} icon={<FileTextOutlined />} onClick={onGenerateScriptAgent} type="primary">
              重新生成
            </Button>
          </Space>
        </Flex>
        <Space className="script-board-status-strip" size={6} wrap>
          <Tag color={isScriptReady ? 'green' : 'orange'}>文稿{isScriptReady ? '已确认' : '待确认'}</Tag>
          <Tag color={isBoardReady ? 'green' : 'orange'}>C 素材{isBoardReady ? '已确认' : '待确认'}</Tag>
        </Space>
      </Card>
    </div>
  );
}
