import DOMPurify from 'dompurify'
import { isString } from 'lodash'

const reg =
	/<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i

// Add hook to remove all urls from anchors.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	let anchor = document.createElement('a')

	if (node.hasAttribute('href')) {
		anchor.href = node.getAttribute('href')
		if (anchor.protocol) {
			node.removeAttribute('href')
		}
	}

	if (node.hasAttribute('action')) {
		anchor.href = node.getAttribute('action')
		if (anchor.protocol) {
			node.removeAttribute('action')
		}
	}

	if (node.hasAttribute('xlink:href')) {
		anchor.href = node.getAttribute('xlink:href')
		if (anchor.protocol) {
			node.removeAttribute('xlink:href')
		}
	}
})

export const sanitizer = DOMPurify.sanitize

export const isHTML = (content) => isString(content) && reg.test(sanitizer(content))
