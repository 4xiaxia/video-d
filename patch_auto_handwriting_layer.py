import re

with open('src/components/AutoHandwritingLayer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add BoardZoneContainer and BoardZoneName imports
if 'BoardZoneContainer' not in content:
    content = content.replace("import { BoardTextSticker } from './BoardTextSticker';", "import { BoardTextSticker } from './BoardTextSticker';\nimport { BoardZoneContainer, type BoardZoneName } from './BoardZoneContainer';")

# Find the render logic
start_idx = content.find('<div className="courseware-board-area"')
end_idx = content.find('</div>\n  );', start_idx) + len('</div>\n  );')

old_render = content[start_idx:end_idx]

# Replace the rendering block
new_render = """<div className="courseware-board-area" ref={boardAreaRef}>
      {['problem', 'analysis', 'solution', 'summary'].map((zoneId) => {
        const zoneName = zoneId as BoardZoneName;
        const zoneClips = visibleBoardClips.filter(clip => getZoneNameFromChainKey(clip.chainKey) === zoneName);
        if (zoneClips.length === 0) return null;

        const firstClip = zoneClips[0];
        const previewPatch = getPreviewPatch(firstClip.id);
        const widthPercent = previewPatch?.widthPercent ?? firstClip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT;
        const xPercent = previewPatch?.xPercent ?? firstClip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT;
        const yPercent = previewPatch?.yPercent ?? firstClip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT;

        let label = '';
        if (zoneName === 'problem') label = '题目';
        else if (zoneName === 'analysis') label = '分析';
        else if (zoneName === 'solution') label = '解答';
        else if (zoneName === 'summary') label = '总结';

        return (
          <BoardZoneContainer
            key={zoneName}
            zoneName={zoneName}
            label={label}
            xPercent={xPercent}
            yPercent={yPercent}
            widthPercent={widthPercent}
            onPointerDown={(event) => {
              const areaRect = boardAreaRef.current?.getBoundingClientRect();
              if (!areaRect) return;
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);

              onSelectBoardClip(firstClip.id);
              startDrag({
                areaRect,
                clipId: firstClip.id,
                mode: 'move',
                originClientX: event.clientX,
                originClientY: event.clientY,
                originFontSize: getBoardStickerFontSize(firstClip.fontSize, boardFontSize),
                originXPercent: firstClip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT,
                originYPercent: firstClip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT,
                originWidthPercent: firstClip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
              });
            }}
          >
            {zoneClips.map((clip, index) => {
              const clipPreviewPatch = getPreviewPatch(clip.id);
              const color = clip.color ?? '#111111';
              const fontSize = getBoardStickerFontSize(clipPreviewPatch?.fontSize ?? clip.fontSize, boardFontSize);

              const liveRevealProgress = readBoardClipRevealProgress(clip, playheadMs);
              const revealProgress =
                draggingClipId === clip.id && frozenRevealRef.current?.clipId === clip.id
                  ? frozenRevealRef.current.progress
                  : liveRevealProgress;

              return (
                <BoardTextSticker
                  color={color}
                  isDragging={draggingClipId === clip.id}
                  isSelected={selectedBoardClipId === clip.id}
                  key={clip.id}
                  onPointerDown={(event) => {
                     // Handled by container
                  }}
                  onResizePointerDown={(event) => {
                    const areaRect = boardAreaRef.current?.getBoundingClientRect();
                    if (!areaRect) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const resizeHandle = event.currentTarget;
                    if (resizeHandle.parentElement instanceof HTMLButtonElement) {
                      resizeHandle.parentElement.setPointerCapture(event.pointerId);
                    }
                    frozenRevealRef.current = {
                      clipId: clip.id,
                      progress: liveRevealProgress,
                    };
                    onSelectBoardClip(clip.id);
                    startDrag({
                      areaRect,
                      clipId: clip.id,
                      mode: 'resize',
                      originClientX: event.clientX,
                      originClientY: event.clientY,
                      originFontSize: getBoardStickerFontSize(clip.fontSize, boardFontSize),
                      originXPercent: clip.xPercent ?? DEFAULT_BOARD_STICKER_X_PERCENT,
                      originYPercent: clip.yPercent ?? DEFAULT_BOARD_STICKER_Y_PERCENT,
                      originWidthPercent: clip.widthPercent ?? DEFAULT_BOARD_STICKER_WIDTH_PERCENT,
                    });
                  }}
                  stackIndex={index}
                  fontFamily={canvas.boardFontFamily}
                  fontLoadKey={boardFontLoadKey}
                  fontSize={fontSize}
                  revealProgress={revealProgress}
                  text={clip.label.trim()}
                  widthPercent={100}
                  xPercent={50}
                  yPercent={50}
                />
              );
            })}
          </BoardZoneContainer>
        );
      })}
    </div>
  );"""

content = content.replace(old_render, new_render)

with open('src/components/AutoHandwritingLayer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
