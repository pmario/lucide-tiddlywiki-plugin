// Build the lucide-core-line plugin: TW core and plugin image titles filled with line SVGs

import fs from "fs";
import path from "path";
import { compactSvg } from "./svg-format.mjs";

const LUCIDE_DIR = path.resolve(process.cwd(), process.env.LUCIDE_DIR || "../lucide");
const CUSTOM_DIR = path.resolve(process.cwd(), "build", "icons");
const PLUGIN_DIR = path.resolve(process.cwd(), "plugins", "tiddlywiki", "lucide-core-line", "tiddlers");
const IMAGES_DIR = path.join(PLUGIN_DIR, "images");
const VANILLA_BASE = path.resolve(process.cwd(), "node_modules", "tiddlywiki", "themes", "tiddlywiki", "vanilla", "base.tid");
const MAPPINGS = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "scripts", "config", "tiddlywiki-mappings.json"), "utf8"));

// Lucide line icons carry this attribute, so the generated rules only hit them
const LINE_SVG = '[stroke="currentColor"]';

/**
 * Turn a tiddler title into a file name, e.g. "$:/core/images/help" to "$__core_images_help.tid".
 * @param {string} title - tiddler title
 * @returns {string} File name
 */
function titleToFile(title) {
	return title.replace(/\$:\//, "$__").replace(/\//g, "_") + ".tid";
}

/**
 * Split a Lucide formatted SVG into its opening tag and its inner elements.
 * @param {string} file - path of the SVG file
 * @returns {{open: string, inner: string}} Opening tag and inner lines
 */
function readParts(file) {
	const match = /^(<svg[\s\S]*?>)\n([\s\S]*?)\n<\/svg>\s*$/.exec(fs.readFileSync(file, "utf8"));
	if(!match) {
		throw new Error(`Unexpected SVG layout: ${file}`);
	}
	return { open: match[1], inner: match[2] };
}

// Core images with dynamic parts, which TW styles or fills at render time
const SPECIAL = {
	// Vanilla shows the clean or dirty group depending on body.tc-dirty
	"$:/core/images/save-button-dynamic": () => {
		const clean = readParts(path.join(LUCIDE_DIR, "icons", "circle-check-big.svg"));
		const dirty = readParts(path.join(LUCIDE_DIR, "icons", "circle.svg"));
		return clean.open + "\n" +
			'<g class="tc-image-save-button-dynamic-clean">\n' + clean.inner + "\n</g>\n" +
			'<g class="tc-image-save-button-dynamic-dirty">\n' + dirty.inner + '\n<circle cx="12" cy="12" r="4" fill="currentColor" />\n</g>\n' +
			"</svg>\n";
	},
	// The only image with wikitext: it shows the current day, like the core icon
	"$:/core/images/new-journal-button": () => {
		const calendar = readParts(path.join(CUSTOM_DIR, "new-journal.svg"));
		return '<$parameters day=<<now "DD">>>\n' + calendar.open + "\n" + calendar.inner + "\n" +
			'<text x="10.5" y="18" fill="currentColor" stroke="none" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="bold" text-anchor="middle"><$text text=<<day>>/></text>\n' +
			"</svg>\n</$parameters>\n";
	},
	// Like the core icon: the custom tower while idle, Lucide's radio tower with the activity colour while busy
	"$:/core/images/network-activity": () => {
		const busy = readParts(path.join(LUCIDE_DIR, "icons", "radio-tower.svg"));
		const idle = readParts(path.join(CUSTOM_DIR, "tower.svg"));
		return busy.open + "\n" +
			"<g class={{{ [{$:/state/http-requests}match[0]then[]else[tc-network-activity-background]] }}}>\n" +
			'<$list filter="[{$:/state/http-requests}match[0]]" variable="ignore">\n' + idle.inner + "\n</$list>\n" +
			'<$list filter="[{$:/state/http-requests}!match[0]]" variable="ignore">\n' + busy.inner + "\n</$list>\n" +
			"</g>\n</svg>\n";
	}
};

/**
 * Write one .tid per mapped core image that has a line SVG source.
 * @returns {{written: number, skipped: string[]}} Count and the titles without a source
 */
function buildImages() {
	fs.rmSync(IMAGES_DIR, { recursive: true, force: true });
	fs.mkdirSync(IMAGES_DIR, { recursive: true });
	let written = 0;
	const skipped = [];
	Object.entries(MAPPINGS).forEach(([title, value]) => {
		const name = value.lucide.replace(/\.svg\.tid$/, "");
		const source = path.join(value.customDir ? CUSTOM_DIR : path.join(LUCIDE_DIR, "icons"), name + ".svg");
		if (!SPECIAL[title] && !fs.existsSync(source)) {
			skipped.push(title);
			return;
		}
		const shortName = title.split("/").pop();
		const classes = value.classes.map((cls) => cls.replace("$(title)$", shortName)).join(" ");
		const tags = value.customDir ? "$:/tags/Image $:/tags/Image/custom" : "$:/tags/Image";
		const svg = SPECIAL[title] ? SPECIAL[title]() : fs.readFileSync(source, "utf8");
		const text = `title: ${title}\ntags: ${tags}\ntype: text/vnd.tiddlywiki\n\n` + compactSvg(svg, classes);
		fs.writeFileSync(path.join(IMAGES_DIR, titleToFile(title)), text, "utf8");
		written++;
	});
	return { written, skipped };
}

/**
 * Collect the vanilla rules that colour icons with fill, keeping their @media wrappers.
 * @param {string} css - vanilla base stylesheet text
 * @returns {{media: string, selectors: string[], value: string}[]} Fill rules
 */
function collectFillRules(css) {
	// Hide transclusions, whose braces would break the block scan
	const tokens = [];
	const text = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\{\{[\s\S]*?\}\}\}|\{\{[^{}]*\}\}/g, (match) => {
		tokens.push(match);
		return `\u0000${tokens.length - 1}\u0000`;
	});
	const restore = (str) => str.replace(/\u0000(\d+)\u0000/g, (m, i) => tokens[i]);
	const rules = [];
	const scan = (block, media) => {
		const re = /([^{}]+)\{/g;
		let match;
		while((match = re.exec(block))) {
			const head = match[1].trim();
			// Find the matching closing brace
			let depth = 1, i = re.lastIndex;
			for(; i < block.length && depth; i++) {
				if(block[i] === "{") depth++;
				if(block[i] === "}") depth--;
			}
			const body = block.slice(re.lastIndex, i - 1);
			re.lastIndex = i;
			if(head.startsWith("@media")) {
				scan(body, restore(head));
				continue;
			}
			const fill = /(?:^|[;\s])fill\s*:\s*([^;]+)/.exec(body);
			if(fill) {
				const selectors = restore(head.split("\n").filter((line) => !line.trim().startsWith("\\")).join(" "))
					.split(",").map((s) => s.trim()).filter((s) => s && !s.includes("::"));
				rules.push({ media, selectors, value: restore(fill[1].trim()) });
			}
		}
	};
	scan(text.slice(text.indexOf("\n\n")), "");
	return rules;
}

/**
 * Build the stylesheet that gives line icons the stroke colour vanilla gives fill icons.
 * @returns {number} Number of generated rules
 */
function buildStrokeStyles() {
	const css = fs.readFileSync(VANILLA_BASE, "utf8");
	const rulesPragma = (/^\\rules[^\n]*/m.exec(css) || [""])[0];
	const lines = [];
	collectFillRules(css).forEach(({ media, selectors, value }) => {
		// A rule on the svg itself maps to the svg, a rule on a parent to the svg inside it
		const targets = selectors.flatMap((s) => [`${s}${LINE_SVG}`, `${s} svg${LINE_SVG}`]);
		const rule = targets.map((t) => `${t} { stroke: ${value}; }`).join("\n");
		lines.push(media ? `${media} {\n${rule}\n}` : rule);
	});
	const header = "title: $:/plugins/tiddlywiki/lucide-core-line/styles/stroke-colours\ntags: $:/tags/Stylesheet\n\n" + rulesPragma + "\n\n";
	fs.mkdirSync(path.join(PLUGIN_DIR, "styles"), { recursive: true });
	fs.writeFileSync(path.join(PLUGIN_DIR, "styles", "stroke-colours.tid"), header + lines.join("\n\n") + "\n", "utf8");
	return lines.length;
}

const { written, skipped } = buildImages();
console.log(`lucide-core-line: ${written} core images, no source for: ${skipped.join(" ")}`);
console.log(`lucide-core-line: ${buildStrokeStyles()} stroke colour rules from ${VANILLA_BASE}`);
