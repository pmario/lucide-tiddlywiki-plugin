// SVG formatting shared by the line icon generators

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
