// @cleanroom-module: boardFontConfig
// @domain: c-canvas-font
// @io-input: customer-provided stylesheet url + font family
// @io-output: sanitized C board font url/family
// @boundary: C board font only; never applies customer font to the whole app body

// @xiaxia-2026-06-08 字体真相修复：生产板书走本地 @font-face（styles.css 已声明），不再依赖远程切片字体。
// 字形分层兜底：文字走乔木体 → 乔木缺的数学符号(× ÷ √ 等)回退落雁体 → 落雁也缺的(≤ ≥ ≈ π)回退 KaiTi。
// 实测：平方乔木体 0 个数学字形；ChenYuluoyan 落雁体 11/15 数学字形。详见 board-font-glyph-vs-route-truth。
export const DEFAULT_BOARD_FONT_URL = '';
export const DEFAULT_BOARD_FONT_NAME = 'Xiaxia Qiaomu Board';
export const DEFAULT_BOARD_FONT_SIZE = 38;
export const LOCAL_BOARD_FONT_FALLBACK = '"ChenYuluoyan Board", "KaiTi", "STKaiti", serif';

export type BoardTypographyConfig = {
  boardFontFamily: string;
  boardFontName: string;
  boardFontSize: number;
  boardFontUrl: string;
};

export type BoardTypographyInput = Partial<{
  boardFontName: number | string;
  boardFontSize: number | string;
  boardFontUrl: string;
}>;

// @xiaxia-2026-06-08 旧存档升级：localStorage / 已存项目里可能存着废弃的远程切片字体
// （name="PING FANG SHAGN SHANG QIAN" 或 url 指向 zeoseven）。在配置中心唯一入口处识别并升级
// 到本地默认，避免旧存档绕过新默认值继续走远程死链。
const DEPRECATED_REMOTE_BOARD_FONT_NAMES = ['PING FANG SHAGN SHANG QIAN', '平方上尚签'];
const DEPRECATED_REMOTE_BOARD_FONT_URL_HINT = 'fontsapi.zeoseven.com';

function isDeprecatedRemoteBoardFont(name: string | undefined, url: string | undefined): boolean {
  const nameHit = typeof name === 'string' && DEPRECATED_REMOTE_BOARD_FONT_NAMES.includes(name.trim());
  const urlHit = typeof url === 'string' && url.includes(DEPRECATED_REMOTE_BOARD_FONT_URL_HINT);
  return nameHit || urlHit;
}

export function createBoardTypographyConfig(input: BoardTypographyInput = {}): BoardTypographyConfig {
  const rawFontName = input.boardFontName === undefined ? undefined : String(input.boardFontName);
  const upgrade = isDeprecatedRemoteBoardFont(rawFontName, input.boardFontUrl);
  const boardFontName = normalizeBoardFontName(upgrade ? DEFAULT_BOARD_FONT_NAME : (rawFontName ?? DEFAULT_BOARD_FONT_NAME));

  return {
    boardFontFamily: createBoardFontFamily(boardFontName),
    boardFontName,
    boardFontSize: normalizeBoardFontSize(input.boardFontSize ?? DEFAULT_BOARD_FONT_SIZE),
    boardFontUrl: normalizeBoardFontUrl(upgrade ? '' : input.boardFontUrl),
  };
}

export function normalizeBoardFontUrl(url: string | undefined): string {
  if (url === undefined) {
    return DEFAULT_BOARD_FONT_URL;
  }

  const candidateUrl = url.trim();

  if (!candidateUrl) {
    return '';
  }

  try {
    const parsedUrl = new URL(candidateUrl);
    return parsedUrl.protocol === 'https:' ? parsedUrl.toString() : '';
  } catch {
    return '';
  }
}

export function normalizeBoardFontName(fontName: string | undefined): string {
  return stripWrappingQuotes(fontName?.trim() || DEFAULT_BOARD_FONT_NAME) || DEFAULT_BOARD_FONT_NAME;
}

export function createBoardFontFamily(fontName: string | undefined): string {
  const normalizedFontName = normalizeBoardFontName(fontName);
  return `"${normalizedFontName}", ${LOCAL_BOARD_FONT_FALLBACK}`;
}

export function normalizeBoardFontSize(fontSize: number | string | undefined): number {
  const parsedFontSize = typeof fontSize === 'string' ? Number(fontSize) : fontSize;
  if (!parsedFontSize || Number.isNaN(parsedFontSize)) {
    return DEFAULT_BOARD_FONT_SIZE;
  }
  return Math.round(Math.min(96, Math.max(12, parsedFontSize)));
}

function stripWrappingQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '').trim();
}
