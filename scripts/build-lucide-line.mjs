// Turn the unmodified Lucide and Lucide Lab SVGs into .tid files for the lucide-line plugin

import fs from "fs";
import path from "path";
import { compactSvg } from "./svg-format.mjs";

const LUCIDE_DIR = path.resolve(process.cwd(), process.env.LUCIDE_DIR || "../lucide");
const TARGET_DIR = path.resolve(process.cwd(), "plugins", "tiddlywiki", "lucide-line", "tiddlers", "images");

const ICON_SETS = [
	{ dir: "icons", tags: "$:/tags/Image/Lucide/Line" },
	{ dir: "lab", tags: "$:/tags/Image/Lucide/Line $:/tags/Image/Lucide/Lab", lab: true }
];

/**
 * Format an array as a TiddlyWiki list field value.
 * @param {string[]} [list] - values
 * @returns {string} Space separated list, values with spaces in [[ ]]
 */
function toList(list) {
	return (list || []).map((item) => item.includes(" ") ? `[[${item}]]` : item).join(" ");
}

/**
 * Build the .tid text for one icon: TW fields from the Lucide .json, then the SVG as is.
 * @param {string} name - icon name, e.g. "house"
 * @param {string} svg - SVG file content
 * @param {object} meta - parsed Lucide .json metadata
 * @param {{tags: string, lab?: boolean}} set - icon set settings
 * @returns {string} The .tid file content
 */
function makeTid(name, svg, meta, set) {
	const fields = [
		["title", "$:/lucide/line/" + name],
		["tags", set.tags],
		["type", "text/vnd.tiddlywiki"],
		["lucide-tags", toList(meta.tags)],
		["categories", toList(meta.categories)],
		["contributors", toList(meta.contributors)],
		["lab", set.lab ? "yes" : ""]
	];
	return fields.filter(([, value]) => value).map(([key, value]) => `${key}: ${value}\n`).join("") + "\n" + svg;
}

if (!fs.existsSync(path.join(LUCIDE_DIR, "lab"))) {
	throw new Error(`No up-to-date Lucide repository at ${LUCIDE_DIR}. Clone it there or set LUCIDE_DIR.`);
}

// Start clean, so icons Lucide dropped do not linger
fs.rmSync(TARGET_DIR, { recursive: true, force: true });
fs.mkdirSync(TARGET_DIR, { recursive: true });

for (const set of ICON_SETS) {
	const iconsDir = path.join(LUCIDE_DIR, set.dir);
	const svgFiles = fs.readdirSync(iconsDir).filter((file) => path.extname(file) === ".svg");
	svgFiles.forEach((file) => {
		const name = path.basename(file, ".svg");
		// The classes let vanilla size the icon in buttons, like the outline icons
		const svg = compactSvg(fs.readFileSync(path.join(iconsDir, file), "utf8"), `lucide lucide-${name} tc-image-button`);
		const meta = JSON.parse(fs.readFileSync(path.join(iconsDir, name + ".json"), "utf8"));
		fs.writeFileSync(path.join(TARGET_DIR, name + ".tid"), makeTid(name, svg, meta, set), "utf8");
	});
	console.log(`${set.dir}: ${svgFiles.length} icons`);
}
