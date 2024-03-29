import fs from 'fs';
import path from 'path';
import processSvg from './render/convertStrokeToPath.mjs';
import { readSvgDirectory, writeSvgFile } from './helpers.mjs';

const ORIGIN_DIR = path.resolve(process.cwd(), 'icons');
const ICONS_DIR = path.resolve(process.cwd(), 'outlined-tw');

console.log(`Convert Stroke to Path...`);

const svgFiles = readSvgDirectory(ORIGIN_DIR);

svgFiles.forEach((svgFile) => {
  const content = fs.readFileSync(path.join(ORIGIN_DIR, svgFile));
  processSvg(content, svgFile).then((svg) => writeSvgFile(svgFile, ICONS_DIR, svg));
});
