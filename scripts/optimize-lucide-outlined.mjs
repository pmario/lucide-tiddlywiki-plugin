import fs from "fs";
import path from "path";
import processOutlined from "./render/processOutlined.mjs";
import { readSvgDirectory, writeSvgFile } from "./helpers.mjs";

const ICONS_DIR = path.resolve(process.cwd(), "outlined");
const IMAGES_DIR = path.resolve(process.cwd(), "build", "lucide", "images");
const LEGACY_IMAGES_DIR = path.resolve(process.cwd(), "build", "lucide", "legacy");

console.log(`Optimizing Lucide SVGs. Save at: ${IMAGES_DIR}`);

const svgFiles = readSvgDirectory(ICONS_DIR);

const PREFIX = "tags: $:/tags/Image/Lucide" +
	"\n\n" +
	"\\parameters (size:\"22pt\")\n";

const PREFIX_LEGACY = "tags: $:/tags/Image/Lucide" +
	"\n\n";

// Ensure the target directory exists
if (!fs.existsSync(IMAGES_DIR)) {
	fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Ensure the target directory exists
if (!fs.existsSync(LEGACY_IMAGES_DIR)) {
	fs.mkdirSync(LEGACY_IMAGES_DIR, { recursive: true });
}

/**
 * Set default attibutes on SVG.
 * @param {string} svg - An SVG string.
 * @returns {string} An SVG string, included the TW .tid header
*/
function addPrefix(content, svgFile, legacy) {
	// Add lucide-<title> class to icons that come from the lucide edition
	const classes = ["lucide","lucide-$(title)$","tc-image-button"];
	const title = svgFile.slice(0,-4);

	// Extend class attribute in the content
	const classList = classes.map(cls => cls.replace("$(title)$", title)).join(" ");
	content = content.replace(/tc-image-button/, `${classList}`);

	let prefix = (legacy) ? PREFIX_LEGACY : PREFIX;
	return "title: $:/lucide/images/" + title + "\n" +
			prefix + content;
}

svgFiles.forEach((svgFile) => {
	const content = fs.readFileSync(path.join(ICONS_DIR, svgFile));
	let legacy = false;
	// Process >= TW v5.3.0
	processOutlined(content, svgFile)
		.then((svg) => addPrefix(svg, svgFile))
		.then((svg) => writeSvgFile(svgFile + ".tid", IMAGES_DIR, svg));

	// Process < TW v5.3.0
	legacy = true;
	processOutlined(content, svgFile, legacy)
		.then((svg) => addPrefix(svg, svgFile, legacy))
		.then((svg) => writeSvgFile(svgFile + ".tid", LEGACY_IMAGES_DIR, svg));});
