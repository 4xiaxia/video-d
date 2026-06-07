with open('src/components/BoardPreviewCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = """// @cleanroom-component: BoardPreviewCard
// @domain: teaching-assets
// @slot: left-sider/board-preview
// @depends: CLayoutPreviewDraft, StageCanvasConfig
// @route-impact: App shell only

import { useMemo } from 'react';
import { Tag, Typography } from 'antd';
import type { CLayoutPreviewDraft, StageCanvasConfig } from '../domain/teachingProject';
import { BoardZoneContainer, type BoardZoneName } from './BoardZoneContainer';
import { COURSEWARE_ZONE_BOUNDS } from '../modules/canvasStage/coursewareChrome';

const { Text } = Typography;

export function BoardPreviewCard({
  draft,
  stageCanvas,
}: {
  draft: CLayoutPreviewDraft | null;
  stageCanvas: StageCanvasConfig;
}) {
  const sortedItems = useMemo(() => {
    if (!draft?.items) return [];
    return [...draft.items].sort((a, b) => a.stackIndex - b.stackIndex || a.id.localeCompare(b.id));
  }, [draft?.items]);

  return (
    <section className="board-preview-card" aria-label="板书预览">
      <Text strong>板书排版预览</Text>
      <Tag color={draft?.items.length ? 'green' : 'default'}>
        {draft?.items.length ? `临时预览 ${draft.items.length} 项` : '暂无预览'}
      </Tag>
      {draft?.items.length ? (
        <div
          className="board-preview-canvas-wrap"
          aria-label="板书排版预览画布"
          style={{
             position: 'relative',
             width: '100%',
             aspectRatio: `${stageCanvas.width} / ${stageCanvas.height}`,
             background: stageCanvas.background || '#ffffff',
             border: '2px dashed #59cee5',
             overflow: 'hidden',
             transform: 'scale(1)',
             transformOrigin: 'top left'
          }}
        >
          <div style={{
            position: 'absolute',
            left: '4%',
            top: '4%',
            color: '#59cee5',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'sans-serif'
          }}>
             板书排版预览（临时）
          </div>
          {['problem', 'analysis', 'solution', 'summary'].map((zoneId) => {
            const zoneName = zoneId as BoardZoneName;

            // Map the items by checking if their groupKey roughly matches the zoneName
            // Note: CLayoutPreviewDraft items use groupKey to map to sections
            const zoneItems = sortedItems.filter(item => {
               if (zoneName === 'problem' && item.groupKey === 'problem') return true;
               if (zoneName === 'analysis' && item.groupKey === 'analysis') return true;
               if (zoneName === 'solution' && item.groupKey === 'solution') return true;
               if (zoneName === 'summary' && item.groupKey === 'summary') return true;

               // Fallback mappings if exact match fails
               if (item.groupKey === '开场读题' && zoneName === 'problem') return true;
               if (item.groupKey === '分析题目' && zoneName === 'analysis') return true;
               if (item.groupKey.startsWith('解题步骤') && zoneName === 'solution') return true;
               if (item.groupKey === '梳理总结' && zoneName === 'summary') return true;

               return false;
            });

            if (zoneItems.length === 0) return null;

            const firstItem = zoneItems[0];
            let label = '';
            if (zoneName === 'problem') label = '题目';
            else if (zoneName === 'analysis') label = '分析';
            else if (zoneName === 'solution') label = '解答';
            else if (zoneName === 'summary') label = '总结';

            const zoneBound = COURSEWARE_ZONE_BOUNDS[zoneName];

            return (
              <BoardZoneContainer
                key={zoneName}
                zoneName={zoneName}
                label={label}
                xPercent={firstItem.xPercent}
                yPercent={Math.max(zoneBound.topRatio * 100, firstItem.yPercent)}
                widthPercent={firstItem.widthPercent}
              >
                 {zoneItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                         fontFamily: stageCanvas.boardFontFamily,
                         fontSize: `${Math.max(12, item.fontSize * 0.4)}px`, // scale down for preview
                         color: '#111111',
                         marginBottom: '4px',
                         whiteSpace: 'pre-wrap',
                         wordBreak: 'break-word'
                      }}
                    >
                       {item.text}
                    </div>
                 ))}
              </BoardZoneContainer>
            );
          })}
        </div>
      ) : (
        <div className="board-preview-placeholder">暂无板书预览</div>
      )}
      <Text type="secondary">用于视觉评审（临时态），不写正式 C 真相。</Text>
    </section>
  );
}
"""

with open('src/components/BoardPreviewCard.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
