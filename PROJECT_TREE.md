# Project Tree

当前关键结构：

```text
src/
  App.tsx
  components/
    StagePreview.tsx
    StagePreviewToolbar.tsx
    StageRecorderControl.tsx
    DrawboardStage.tsx
    CanvasRecordingSurface.tsx
    AutoHandwritingLayer.tsx
    BoardTextSticker.tsx
    CStickerFrame.tsx
  modules/
    canvasStage/
      coursewareChrome.ts
      coursewareZoneLayout.ts
      drawCoursewareStageFrame.ts
    timeline-factory/
      mapBoardEventsToTimelineClips.ts
      createBoardEventsFromTtsUnits.ts
      createTtsBatchJobs.ts
    stageRecorder/
      useCanvasRecorder.ts
    boardSticker/
      boardStickerGeometry.ts
      boardTextDisplayRoute.ts
scripts/
  check-board-boundaries.mjs
  check-drawboard-component-boundaries.mjs
  check-board-clips-merge.mjs
  check-board-event-clips.mjs
  check-board-events.mjs
  check-tts-batch-jobs.mjs
```

本轮没有新增业务目录；主要是恢复 `StagePreview.tsx` 实体入口并同步守护脚本。
