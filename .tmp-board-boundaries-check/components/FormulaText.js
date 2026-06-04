import { jsx as _jsx } from "react/jsx-runtime";
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { hasBoardMath, tokenizeBoardText } from '../modules/boardSticker';
export function FormulaText({ as = 'span', children, className, classNamePrefix = 'math-text', rootClassName = classNamePrefix, ...restProps }) {
    const mergedClassName = [rootClassName, className].filter(Boolean).join(' ');
    const renderedChildren = typeof children === 'string' && hasBoardMath(children) ? (_jsx("span", { className: `${classNamePrefix}__rich`, "aria-label": children, children: tokenizeBoardText(children).map((line, lineIndex) => (_jsx("span", { className: `${classNamePrefix}__line`, children: line.map((token, tokenIndex) => {
                if (token.kind === 'text') {
                    return (_jsx("span", { className: `${classNamePrefix}__text-run`, children: token.text }, `${lineIndex}-${tokenIndex}`));
                }
                return (_jsx("span", { className: `${classNamePrefix}__math-run`, dangerouslySetInnerHTML: { __html: renderLatex(token.latex) } }, `${lineIndex}-${tokenIndex}`));
            }) }, `${lineIndex}-${line.map((token) => token.kind).join('-')}`))) })) : (children);
    if (as === 'div') {
        return (_jsx("div", { className: mergedClassName, ...restProps, children: renderedChildren }));
    }
    if (as === 'p') {
        return (_jsx("p", { className: mergedClassName, ...restProps, children: renderedChildren }));
    }
    return (_jsx("span", { className: mergedClassName, ...restProps, children: renderedChildren }));
}
function renderLatex(latex) {
    return katex.renderToString(latex, {
        displayMode: false,
        output: 'html',
        strict: false,
        throwOnError: false,
        trust: false,
    });
}
