import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// @cleanroom-component: BoardTypographyFields
// @domain: c-canvas-font
// @slot: settings/default-board-font + right-inspector/current-board-font
// @depends: boardFontConfig, antd form/input controls
// @io-input: form name prefix or current BoardTypographyConfig
// @io-output: AppConfig.stageDefaults.canvas fields or TeachingProject.stage.canvas patch
// @boundary: C board typography controls only; never edits UI theme fonts, A audio, or B timing
import { Form, Input, InputNumber, Typography } from 'antd';
import { createBoardFontFamily, DEFAULT_BOARD_FONT_NAME, DEFAULT_BOARD_FONT_SIZE, DEFAULT_BOARD_FONT_URL, normalizeBoardFontName, normalizeBoardFontSize, normalizeBoardFontUrl, } from '../modules/boardFont/boardFontConfig';
const { Text } = Typography;
const localFontPlaceholder = '留空使用项目/本机字体；可填 HTTPS 字体 CSS';
export function BoardTypographyFormFields({ helpText, labelPrefix, namePrefix, }) {
    return (_jsxs(_Fragment, { children: [_jsx(Form.Item, { label: `${labelPrefix}字体名称`, name: [...namePrefix, 'boardFontName'], children: _jsx(Input, { placeholder: DEFAULT_BOARD_FONT_NAME }) }), _jsx(Form.Item, { label: `${labelPrefix}字号`, name: [...namePrefix, 'boardFontSize'], children: _jsx(InputNumber, { min: 12, max: 96, placeholder: String(DEFAULT_BOARD_FONT_SIZE) }) }), _jsx(Form.Item, { label: `${labelPrefix}字体地址`, name: [...namePrefix, 'boardFontUrl'], children: _jsx(Input, { placeholder: localFontPlaceholder }) }), helpText ? _jsx(Text, { type: "secondary", children: helpText }) : null] }));
}
export function BoardTypographyControlledFields({ labelPrefix, onChange, value, }) {
    return (_jsxs(_Fragment, { children: [_jsxs("label", { className: "inspector-field", children: [_jsxs(Text, { strong: true, children: [labelPrefix, "\u5B57\u4F53"] }), _jsx(Input, { onChange: (event) => {
                            const boardFontName = normalizeBoardFontName(event.target.value);
                            onChange({
                                boardFontFamily: createBoardFontFamily(boardFontName),
                                boardFontName,
                            });
                        }, placeholder: DEFAULT_BOARD_FONT_NAME, value: value.boardFontName || DEFAULT_BOARD_FONT_NAME })] }), _jsxs("label", { className: "inspector-field", children: [_jsxs(Text, { strong: true, children: [labelPrefix, "\u5B57\u53F7"] }), _jsx(InputNumber, { max: 96, min: 12, onChange: (nextValue) => onChange({
                            boardFontSize: normalizeBoardFontSize(nextValue ?? value.boardFontSize),
                        }), step: 1, value: value.boardFontSize || DEFAULT_BOARD_FONT_SIZE })] }), _jsxs("label", { className: "inspector-field", children: [_jsxs(Text, { strong: true, children: [labelPrefix, "\u5B57\u4F53\u5730\u5740"] }), _jsx(Input, { onChange: (event) => onChange({
                            boardFontUrl: event.target.value,
                        }), onBlur: (event) => {
                            const boardFontName = normalizeBoardFontName(value.boardFontName);
                            onChange({
                                boardFontFamily: createBoardFontFamily(boardFontName),
                                boardFontName,
                                boardFontUrl: normalizeBoardFontUrl(event.target.value),
                            });
                        }, placeholder: localFontPlaceholder, value: value.boardFontUrl || DEFAULT_BOARD_FONT_URL })] })] }));
}
