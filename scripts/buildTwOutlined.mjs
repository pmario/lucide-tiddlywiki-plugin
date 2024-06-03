import fs from "fs";
import path from "path";
import processSvg from "./render/convertStrokeToPath.mjs";
import { readSvgDirectory, writeSvgFile } from "./helpers.mjs";

const ORIGIN_DIR = path.resolve(process.cwd(), "build", "icons");
const ICONS_DIR = path.resolve(process.cwd(), "build", "outlined-tw");

console.log(`Convert Stroke to Path and save at: ${ICONS_DIR}`);

const svgFiles = readSvgDirectory(ORIGIN_DIR);

// Ensure the target directory exists
if (!fs.existsSync(ICONS_DIR)) {
	fs.mkdirSync(ICONS_DIR, { recursive: true });
}

svgFiles.forEach((svgFile) => {
  const content = fs.readFileSync(path.join(ORIGIN_DIR, svgFile));
  processSvg(content, svgFile).then((svg) => writeSvgFile(svgFile, ICONS_DIR, svg));
});
