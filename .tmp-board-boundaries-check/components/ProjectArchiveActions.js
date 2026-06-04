import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// @cleanroom-component: ProjectArchiveActions
// @domain: local-project-archive
// @slot: app-header-command-bar
// @depends: localTaskArchive callbacks, recent LocalTaskSnapshot[]
// @io-input: recentTaskSnapshots, save/import/restore/refresh callbacks
// @io-output: user-triggered local archive operations
// @boundary: project management only; no workflow step switching, no TTS, no timeline mutation
import { FolderAddOutlined, FolderOpenOutlined, HistoryOutlined, ImportOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Flex, message, Modal, Space, Tag, Tooltip, Typography } from 'antd';
import { useState } from 'react';
const { Text } = Typography;
export function ProjectArchiveActions({ defaultSaveDirectoryLabel, onImportLocalTaskArchive, onRefreshLocalTaskSnapshots, onRestoreLocalTaskSnapshot, onSaveLocalTaskArchive, onSetDefaultSaveDirectory, recentTaskSnapshots, }) {
    const [messageApi, contextHolder] = message.useMessage();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [isImportingLocalArchive, setIsImportingLocalArchive] = useState(false);
    const [isSavingLocalArchive, setIsSavingLocalArchive] = useState(false);
    const [isSettingDefaultDirectory, setIsSettingDefaultDirectory] = useState(false);
    const [restoringSnapshotId, setRestoringSnapshotId] = useState('');
    const handleSaveLocalTaskArchive = async () => {
        setIsSavingLocalArchive(true);
        try {
            const result = await onSaveLocalTaskArchive();
            const audioText = result.audioTotalCount
                ? `，音频 ${result.audioSavedCount}/${result.audioTotalCount} 个已写入`
                : '，当前暂无音频文件';
            const defaultText = result.usedDefaultDirectory ? `默认目录 ${result.rootDirectoryName}` : `已记住默认目录 ${result.rootDirectoryName}`;
            messageApi.success(`已保存到任务文件夹 ${result.folderName}：${result.jsonFileCount} 个 JSON${audioText}，${defaultText}。`);
        }
        catch (error) {
            messageApi.error(error instanceof Error ? error.message : String(error));
        }
        finally {
            setIsSavingLocalArchive(false);
        }
    };
    const handleSetDefaultSaveDirectory = async () => {
        setIsSettingDefaultDirectory(true);
        try {
            const result = await onSetDefaultSaveDirectory();
            messageApi.success(`已设置默认保存目录：${result.directoryName}。`);
        }
        catch (error) {
            messageApi.error(error instanceof Error ? error.message : String(error));
        }
        finally {
            setIsSettingDefaultDirectory(false);
        }
    };
    const handleImportLocalTaskArchive = async () => {
        setIsImportingLocalArchive(true);
        try {
            const result = await onImportLocalTaskArchive();
            const audioText = result.audioTotalCount
                ? `，音频 ${result.audioRestoredCount}/${result.audioTotalCount} 个已恢复`
                : '，当前暂无本地音频';
            messageApi.success(`已导入 ${result.folderName}：${result.archivePackage.editRecords.length} 条编辑记录，${result.archivePackage.productManifest.length} 项产物清单${audioText}。`);
        }
        catch (error) {
            messageApi.error(error instanceof Error ? error.message : String(error));
        }
        finally {
            setIsImportingLocalArchive(false);
        }
    };
    const handleRestoreLocalTaskSnapshot = async (snapshotId) => {
        setRestoringSnapshotId(snapshotId);
        try {
            const restored = await onRestoreLocalTaskSnapshot(snapshotId);
            if (restored) {
                messageApi.success('已恢复最近任务。');
                setHistoryOpen(false);
            }
            else {
                messageApi.warning('没有找到这个任务快照。');
            }
        }
        catch (error) {
            messageApi.error(error instanceof Error ? error.message : String(error));
        }
        finally {
            setRestoringSnapshotId('');
        }
    };
    return (_jsxs(_Fragment, { children: [contextHolder, _jsxs(Space, { className: "project-archive-actions", size: 6, wrap: true, children: [_jsx(Tooltip, { title: defaultSaveDirectoryLabel ? `当前默认目录：${defaultSaveDirectoryLabel}` : '选择一次后，保存目录会默认写入这里', children: _jsx(Button, { icon: _jsx(FolderAddOutlined, {}), loading: isSettingDefaultDirectory, onClick: () => void handleSetDefaultSaveDirectory(), children: "\u8BBE\u7F6E\u9ED8\u8BA4\u76EE\u5F55" }) }), defaultSaveDirectoryLabel ? _jsxs(Tag, { color: "green", children: ["\u9ED8\u8BA4\uFF1A", defaultSaveDirectoryLabel] }) : null, _jsx(Button, { icon: _jsx(FolderOpenOutlined, {}), loading: isSavingLocalArchive, onClick: () => void handleSaveLocalTaskArchive(), children: "\u4FDD\u5B58\u76EE\u5F55" }), _jsx(Button, { icon: _jsx(HistoryOutlined, {}), onClick: () => setHistoryOpen(true), children: "\u5386\u53F2\u5DE5\u7A0B" }), _jsx(Button, { icon: _jsx(ImportOutlined, {}), loading: isImportingLocalArchive, onClick: () => void handleImportLocalTaskArchive(), children: "\u5BFC\u5165 project.json" })] }), _jsx(Modal, { footer: null, onCancel: () => setHistoryOpen(false), open: historyOpen, title: "\u5386\u53F2\u5DE5\u7A0B", width: 520, children: _jsxs("div", { className: "project-history-panel", children: [_jsxs(Flex, { align: "center", justify: "space-between", gap: 8, children: [_jsx(Text, { type: "secondary", children: "\u6682\u65E0\u53EF\u6062\u590D\u4EFB\u52A1\u3002" }), _jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: () => void onRefreshLocalTaskSnapshots(), size: "small", children: "\u5237\u65B0" })] }), recentTaskSnapshots.length ? (_jsx("div", { className: "project-history-list", children: recentTaskSnapshots.map((snapshot) => (_jsxs(Button, { block: true, className: "project-history-item", loading: restoringSnapshotId === snapshot.id, onClick: () => void handleRestoreLocalTaskSnapshot(snapshot.id), children: [_jsx("span", { children: snapshot.archiveFolderName || snapshot.title }), _jsxs("small", { children: [snapshot.editRecords?.length ? `${snapshot.editRecords.length} 条记录 · ` : '', formatSnapshotTime(snapshot.updatedAt)] })] }, snapshot.id))) })) : (_jsxs("div", { className: "project-history-empty", children: [_jsx(HistoryOutlined, {}), _jsx(Text, { type: "secondary", children: "\u6682\u65E0\u5386\u53F2\u5DE5\u7A0B" })] }))] }) })] }));
}
function formatSnapshotTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    return date.toLocaleString('zh-CN', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: '2-digit',
    });
}
