import { optimize } from 'svgo';
import { parseSync, stringify } from 'svgson';
import DEFAULT_ATTRS from '../config/tiddlywiki-attrs.json' assert { type: 'json' };
import LEGACY_ATTRS from '../config/tiddlywiki-legacy-attrs.json' assert { type: 'json' };

/**
 * Optimize SVG with `svgo`.
 * @param {string} svg - An SVG string.
 * @returns {Promise<string>} An optimized svg
 */
async function convertSvgToTw(svg, path) {
	const result = optimize(svg, {
		path,
		plugins: [
			{
				name: 'preset-default',
				params: {
					overrides: {
						convertShapeToPath: false,
						mergePaths: false,
					},
				},
			},
			{
				name: 'convertPathData',
				params: {
					floatPrecision: 2
				},
			},
			{
				name: 'removeAttrs',
				params: {
					attrs: '(fill|stroke.*)',
				},
			},
		],
	});

	return result.data;
}

/**
 * Set default attibutes on SVG.
 * @param {string} svg - An SVG string.
 * @returns {string} An SVG string, included with the default attributes.
 */
function setAttrs(svg, legacy) {
	let contents = parseSync(svg);

	contents.attributes = (legacy) ? LEGACY_ATTRS : DEFAULT_ATTRS;

	return stringify(contents);
}

/**
 * Process SVG string.
 * @param {string} svg An SVG string.
 * @returns {Promise<string>} An optimized svg
 */
function processOutlined(svg, path, legacy) {
	return (
		convertSvgToTw(svg, path)
		.then((svg) => setAttrs(svg, legacy))
		.then((svg) => svg.replace(/\"🗚\"/g, '<<size>>'))
	);
}

export default processOutlined;
