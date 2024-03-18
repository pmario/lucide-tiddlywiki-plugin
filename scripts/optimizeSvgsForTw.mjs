import fs from 'fs';
import path from 'path';
import processSvgForTw from './render/processSvgForTw.mjs';
import { readSvgDirectory, writeSvgFile } from './helpers.mjs';

const ICONS_DIR = path.resolve(process.cwd(), 'outlined');
const IMAGES_DIR = path.resolve(process.cwd(), './core/images');

console.log(`Optimizing SVGs...`);

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
	processSvgForTw(content, svgFile)
		.then((svg) => addPrefix(svg, svgFile))
		.then((svg) => writeSvgFile(svgFile + ".tid", IMAGES_DIR, svg));
});
