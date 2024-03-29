import fs from 'fs';
import path from 'path';
import processLucideOutlined from './render/processLucideOutlined.mjs';
import { readSvgDirectory, writeSvgFile } from './helpers.mjs';

const ICONS_DIR = path.resolve(process.cwd(), 'outlined');
const IMAGES_DIR = path.resolve(process.cwd(), './lucide/images');

console.log(`Optimizing Lucide SVGs...`);

const svgFiles = readSvgDirectory(ICONS_DIR);

const PREFIX = "tags: $:/tags/Image/Lucide " + 
	"\n\n" +
	'\\parameters (size:"22pt")\n';

/**
 * Set default attibutes on SVG.
 * @param {string} svg - An SVG string.
 * @returns {string} An SVG string, included the TW .tid header
*/
function addPrefix(content, svgFile) {
	return "title: $:/core/images/" + svgFile.slice(0,-4) + "\n" +
			PREFIX + content;
}

svgFiles.forEach((svgFile) => {
	const content = fs.readFileSync(path.join(ICONS_DIR, svgFile));
	processLucideOutlined(content, svgFile)
		.then((svg) => addPrefix(svg, svgFile))
		.then((svg) => writeSvgFile(svgFile + ".tid", IMAGES_DIR, svg));
});
