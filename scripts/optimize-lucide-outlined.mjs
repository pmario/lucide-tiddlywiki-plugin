import fs from "fs";
import path from "path";
import processOutlined from "./render/processOutlined.mjs";
import { readSvgDirectory, writeSvgFile } from "./helpers.mjs";

const OUTLINED_DIR = path.resolve(process.cwd(), "build", "outlined-lucide");
const BUILD_DIR = path.resolve(process.cwd(), "build", "lucide");
const IMAGES_DIR = path.join(BUILD_DIR, "images");
const LEGACY_IMAGES_DIR = path.join(BUILD_DIR, "legacy");

const ICON_SETS = [
	{ dir: "icons", tags: "$:/tags/Image/Lucide" },
	{ dir: "lab", tags: "$:/tags/Image/Lucide $:/tags/Image/Lucide/Lab" }
];

const PARAMETERS = '\\parameters (size:"22pt", stroke:"none", stroke-width:"0")\n';

console.log(`Optimizing Lucide SVGs. Save at: ${IMAGES_DIR}`);

// Start clean, so icons Lucide dropped do not linger
fs.rmSync(BUILD_DIR, { recursive: true, force: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });
fs.mkdirSync(LEGACY_IMAGES_DIR, { recursive: true });

/**
 * Add the lucide classes and the TW .tid header to an optimized SVG.
 * @param {string} content - optimized SVG
 * @param {string} svgFile - file name, e.g. "house.svg"
 * @param {string} tags - value of the tags field
 * @param {boolean} [legacy] - true for TW < v5.3.0, which has no \parameters
 * @returns {string} The .tid file content
 */
function addPrefix(content, svgFile, tags, legacy) {
	// Add lucide-<title> class to icons that come from the lucide edition
	const classes = ["lucide","lucide-$(title)$","tc-image-button"];
	const title = svgFile.slice(0,-4);

	// Extend class attribute in the content
	const classList = classes.map(cls => cls.replace("$(title)$", title)).join(" ");
	content = content.replace(/tc-image-button/, `${classList}`);

	return "title: $:/lucide/images/" + title + "\n" +
			"tags: " + tags + "\n\n" +
			(legacy ? "" : PARAMETERS) + content;
}

ICON_SETS.forEach(({ dir, tags }) => {
	const iconsDir = path.join(OUTLINED_DIR, dir);
	readSvgDirectory(iconsDir).forEach((svgFile) => {
		const content = fs.readFileSync(path.join(iconsDir, svgFile));
		// Process >= TW v5.3.0
		processOutlined(content, svgFile)
			.then((svg) => addPrefix(svg, svgFile, tags))
			.then((svg) => writeSvgFile(svgFile + ".tid", IMAGES_DIR, svg));

		// Process < TW v5.3.0
		processOutlined(content, svgFile, true)
			.then((svg) => addPrefix(svg, svgFile, tags, true))
			.then((svg) => writeSvgFile(svgFile + ".tid", LEGACY_IMAGES_DIR, svg));
	});
});
