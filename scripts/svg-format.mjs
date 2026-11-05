// SVG formatting shared by the line icon generators

// Same parameters as the filled icons, with Lucide's own values as defaults
const LINE_PARAMETERS = '\\parameters (size:"24", stroke:"currentColor", stroke-width:"2")\n';
const PARAMETER_ATTRIBUTES = [
	[' width="24"', " width=<<size>>"],
	[' height="24"', " height=<<size>>"],
	[' stroke="currentColor"', " stroke=<<stroke>>"],
	[' stroke-width="2"', " stroke-width=<<stroke-width>>"]
];

/**
 * Prepend the \parameters pragma and use its size, stroke and stroke-width in the opening svg tag.
 * @param {string} svg - SVG with Lucide's default attributes
 * @returns {string} Wikitext with a parameterised SVG
 */
export function withParameters(svg) {
	return LINE_PARAMETERS + svg.replace(/<svg\b[^>]*>/, (tag) => PARAMETER_ATTRIBUTES.reduce((result, [attribute, value]) => {
		if(!result.includes(attribute)) {
			throw new Error(`Line icon without${attribute}: ${tag}`);
		}
		return result.replace(attribute, value);
	}, tag));
}

/**
 * Put the opening tag, the body and the closing tag on one line each, with the classes first and without xmlns.
 * @param {string} svg - Lucide formatted SVG, optionally wrapped in wikitext lines
 * @param {string} [classes] - class attribute value
 * @returns {string} Three-line SVG
 */
export function compactSvg(svg, classes) {
	const withTag = svg.replace(/<svg\b([^>]*)>/, (match, attributes) => {
		const list = attributes.replace(/\s*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, "").replace(/\s+/g, " ").trim();
		return "<svg" + (classes ? ` class="${classes}"` : "") + (list ? " " + list : "") + ">";
	});
	// A line break between tags goes away, one inside a tag separates attributes
	const oneLine = withTag.replace(/>\s*\n\s*</g, "><").replace(/\s*\n\s*/g, " ").trim();
	return oneLine.replace(/(<svg\b[^>]*>)([\s\S]*)(<\/svg>)/, "$1\n$2\n$3");
}
