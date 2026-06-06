// @cleanroom-component: ProblemUploadPreview
// @domain: teaching-assets
// @slot: left-sider/problem-import
// @depends: TeachingProject.assets(problemImage/boardLayout), importProblemImage action
// ID: cleanroom-assets-problem-import-001
// 💾 数据: problemImage.sourceRef + boardLayout.summary
// 🔌 事件: beforeUpload -> onImportProblemImage
// 🎨 状态: no image / has image / C material candidate overlay
// @io-input: asset, boardSummary, hasConfirmedBoard, onImportProblemImage
// @io-output: onImportProblemImage(file)
// @route: App shell / left sider / assets problem tab
// @fields: TeachingProject.assets(kind=problemImage), TeachingProject.assets(kind=boardLayout).summary
// @boundary: image import and preview only; does not edit problemText, scriptText, boardLayout, timeline

import { InboxOutlined } from '@ant-design/icons';
import { Tag, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload';
import type { TeachingAsset } from '../domain/teachingProject';
import { MathText } from './MathText';

export function ProblemUploadPreview({
  asset,
  boardSummary,
  hasConfirmedBoard,
  onImportProblemImage,
}: {
  asset: TeachingAsset | undefined;
  boardSummary: string | undefined;
  hasConfirmedBoard: boolean;
  onImportProblemImage: (file: File) => void;
}) {
  const hasImage = Boolean(asset?.sourceRef);
  const uploadTitle = hasImage ? asset?.title || '题图已上传' : '题图入口';
  const uploadHint = hasImage ? '点击更换题图，当前题文链路会继续保留。' : '未接 API 时，先用本地题图跑通画布和素材流。';

  return (
    <Upload
      accept="image/*"
      beforeUpload={(file: RcFile) => {
        onImportProblemImage(file);
        return false;
      }}
      className={hasImage ? 'problem-image-uploader has-image' : 'problem-image-uploader'}
      maxCount={1}
      showUploadList={false}
    >
      <span className={hasImage ? 'problem-upload-rail problem-upload-rail--has-image' : 'problem-upload-rail'}>
        <span className={hasImage ? 'problem-upload-thumb problem-upload-thumb--image' : 'problem-upload-thumb problem-upload-thumb--empty'} aria-hidden={!hasImage}>
          {hasImage ? <img alt={asset?.title} src={asset?.sourceRef} /> : <InboxOutlined />}
          {!hasImage ? <span className="problem-upload-thumb-label">待上传</span> : null}
        </span>
        <span className="problem-upload-copy">
          <span className="problem-upload-title-row">
            <strong className="problem-upload-title">{uploadTitle}</strong>
            <Tag className="problem-upload-status-tag" color={hasImage ? 'blue' : 'default'}>
              {hasImage ? '已上传' : '本地导入'}
            </Tag>
          </span>
          <span className="problem-upload-hint">{uploadHint}</span>
          {hasConfirmedBoard ? (
            <span className="problem-upload-board-summary">
              <Tag color="green">C素材候选已生成</Tag>
              <MathText className="board-confirm-overlay-text">{boardSummary}</MathText>
            </span>
          ) : null}
          <span className="problem-upload-actions">
            <span className="problem-upload-button">{hasImage ? '更换题图' : '选择题图'}</span>
            <span className="problem-upload-subhint">{hasImage ? '保持当前识别入口' : '按钮导入，更省位置'}</span>
          </span>
        </span>
      </span>
    </Upload>
  );
}
