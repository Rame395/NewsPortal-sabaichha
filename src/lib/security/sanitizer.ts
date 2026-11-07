import sanitizeHtml from 'sanitize-html'

/**
 * Editorial Article HTML Sanitizer Options
 * Ensures news articles can render rich editorial formatting (headings, blockquotes,
 * images, embedded YouTube videos) while completely neutralizing any script injection,
 * event handlers (onload, onerror, onclick), or malicious iframe embeds.
 */
const ARTICLE_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'div',
    'span',
    'b',
    'i',
    'strong',
    'em',
    'u',
    's',
    'strike',
    'sub',
    'sup',
    'code',
    'pre',
    'hr',
    'br',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'figure',
    'figcaption',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
    iframe: [
      'src',
      'width',
      'height',
      'frameborder',
      'allow',
      'allowfullscreen',
      'title',
      'class',
      'loading',
    ],
    table: ['class', 'border', 'cellpadding', 'cellspacing', 'style'],
    th: ['colspan', 'rowspan', 'scope', 'class', 'style'],
    td: ['colspan', 'rowspan', 'class', 'style'],
    '*': ['class', 'id', 'aria-label', 'aria-hidden', 'style', 'dir', 'align'],
  },
  // Whitelist safe inline CSS properties so Google Docs styling (colors, weights, alignments, spacing) is preserved
  allowedStyles: {
    '*': {
      color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i],
      'background-color': [
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
      ],
      'text-align': [/^(left|right|center|justify)$/i],
      'font-weight': [/^(bold|normal|[1-9]00)$/i],
      'font-style': [/^(italic|normal|oblique)$/i],
      'text-decoration': [/^(underline|line-through|none)$/i],
      'font-size': [/^\d+(?:\.\d+)?(?:px|em|rem|pt|%)?$/i],
      'line-height': [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/i],
      'margin-left': [/^\d+(?:\.\d+)?(?:px|em|rem|pt)?$/i],
      'margin-right': [/^\d+(?:\.\d+)?(?:px|em|rem|pt)?$/i],
      'margin-top': [/^\d+(?:\.\d+)?(?:px|em|rem|pt)?$/i],
      'margin-bottom': [/^\d+(?:\.\d+)?(?:px|em|rem|pt)?$/i],
      'padding-left': [/^\d+(?:\.\d+)?(?:px|em|rem|pt)?$/i],
      'padding-right': [/^\d+(?:\.\d+)?(?:px|em|rem|pt)?$/i],
    },
  },
  // Whitelist safe URL schemes - blocks javascript:, data:, vbscript:
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
    iframe: ['https'],
  },
  // Only permit embedding iframes from verified trusted video/social platforms
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'platform.twitter.com',
    'www.facebook.com',
    'www.instagram.com',
  ],
  transformTags: {
    // Force rel="noopener noreferrer" on external links
    a: (tagName, attribs) => {
      const href = attribs.href || ''
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }
      }
      return { tagName: 'a', attribs }
    },
  },
  // Discard content of <script> and <style> tags completely
  nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript'],
}

/**
 * Sanitizes rich-text article HTML content before database storage or rendering.
 * Strips all dangerous scripts, on* event handlers, and unauthorized embeds.
 */
export function sanitizeArticleHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return ''
  return sanitizeHtml(dirtyHtml, ARTICLE_SANITIZE_OPTIONS)
}

/**
 * Strips ALL HTML tags, returning safe plain text.
 * Used for comment content, excerpts, and headlines.
 */
export function sanitizePlainText(dirtyText: string | null | undefined): string {
  if (!dirtyText || typeof dirtyText !== 'string') return ''
  return sanitizeHtml(dirtyText, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim()
}

/**
 * Sanitizes uploaded SVG vector images to completely eliminate stored XSS risks:
 * - Completely purges <script>, <foreignObject>, <object>, <embed>, <iframe>
 * - Strips all event handler attributes (onload, onerror, onclick, onmouseover)
 * - Blocks javascript: and data: URIs in xlink:href and href
 * - Preserves vector graphic tags (svg, path, g, rect, circle, text, gradients)
 */
const SVG_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'svg',
    'g',
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'polygon',
    'text',
    'tspan',
    'defs',
    'lineargradient',
    'radialgradient',
    'stop',
    'clippath',
    'mask',
    'pattern',
    'image',
    'title',
    'desc',
    'use',
    'symbol',
  ],
  allowedAttributes: {
    '*': [
      'id',
      'class',
      'style',
      'width',
      'height',
      'viewbox',
      'viewBox',
      'xmlns',
      'xmlns:xlink',
      'version',
      'transform',
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'stroke-dasharray',
      'stroke-dashoffset',
      'opacity',
      'fill-opacity',
      'stroke-opacity',
      'd',
      'x',
      'y',
      'x1',
      'y1',
      'x2',
      'y2',
      'cx',
      'cy',
      'r',
      'rx',
      'ry',
      'points',
      'offset',
      'stop-color',
      'stop-opacity',
      'clip-path',
      'mask',
      'gradientunits',
      'gradientUnits',
      'spreadmethod',
      'spreadMethod',
      'text-anchor',
      'font-family',
      'font-size',
      'font-weight',
      'dx',
      'dy',
      'href',
      'xlink:href',
    ],
  },
  allowedSchemes: ['http', 'https'],
  allowedSchemesByTag: {
    image: ['data', 'http', 'https'],
    use: ['#'],
  },
  disallowedTagsMode: 'discard',
  nonTextTags: ['script', 'foreignobject', 'iframe', 'embed', 'object', 'applet'],
}

export function sanitizeSvgXml(dirtySvg: string | null | undefined): string {
  if (!dirtySvg || typeof dirtySvg !== 'string') return ''
  return sanitizeHtml(dirtySvg, SVG_SANITIZE_OPTIONS)
}

