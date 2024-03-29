import fs from 'fs';
import path from 'path';
import processSvg from './render/processSvg.mjs';
import { readSvgDirectory, writeSvgFile } from './helpers.mjs';

const ORIGIN_DIR = path.resolve(process.cwd(), 'origin');
const ICONS_DIR = path.resolve(process.cwd(), 'icons');

console.log(`Create TW icons...`);

const svgFiles = readSvgDirectory(ORIGIN_DIR);

svgFiles.forEach((svgFile) => {
  const content = fs.readFileSync(path.join(ORIGIN_DIR, svgFile));
  processSvg(content, svgFile).then((svg) => writeSvgFile(svgFile, ICONS_DIR, svg));
});
