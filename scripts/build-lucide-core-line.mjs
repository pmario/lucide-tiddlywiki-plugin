// Build the lucide-core-line plugin: TW core and plugin image titles filled with line SVGs

import fs from "fs";
import path from "path";
import { compactSvg } from "./svg-format.mjs";

const LUCIDE_DIR = path.resolve(process.cwd(), process.env.LUCIDE_DIR || "../lucide");
const CUSTOM_DIR = path.resolve(process.cwd(), "build", "icons");
const PLUGIN_DIR = path.resolve(process.cwd(), "plugins", "tiddlywiki", "lucide-core-line", "tiddlers");
const IMAGES_DIR = path.join(PLUGIN_DIR, "images");
const TW_DIR = path.resolve(process.cwd(), "node_modules", "tiddlywiki");
const VANILLA_BASE = path.join(TW_DIR, "themes", "tiddlywiki", "vanilla", "base.tid");
const twPluginStyles = (name) => path.join(TW_DIR, "plugins", "tiddlywiki", name, "styles.tid");
// TW plugins that colour their icons with fill; tiddlyweb's rules colour its own filled icons
const PLUGIN_STYLES = ["text-slicer", "upgrade"].map((name) => ({ name, file: twPluginStyles(name) }));
// Each gets its own stylesheet, which applies only while its source stylesheet exists
const OWN_STYLES = [
	{ name: "seamless", file: path.join(TW_DIR, "themes", "tiddlywiki", "seamless", "base.tid"), note: "Seamless recolours icons with fill while it is the active theme" },
	{ name: "comments", file: twPluginStyles("comments"), note: "The comments plugin colours its icons with fill while it is installed" },
	{ name: "menubar", file: twPluginStyles("menubar"), note: "The menubar plugin colours its icons with fill while it is installed" },
	{ name: "tour", file: twPluginStyles("tour"), note: "The tour plugin colours its icons with fill while it is installed" }
];
const MAPPINGS = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "scripts", "config", "tiddlywiki-mappings.json"), "utf8"));

// Lucide line icons carry this attribute, so the generated rules only hit them
const LINE_SVG = '[stroke="currentColor"]';

// The core colours these with an inline fill and the same inline color, which beat every stylesheet rule
const INLINE_FILL = ["html body.tc-body .tc-tag-label", "html body.tc-body .tc-thumbnail-icon"];

// The remove button of a tag has the inline fill of its tag but the color of .tc-btn-invisible, and currentColor inherits as a keyword
const INLINE_FILL_INHERIT = ["html body.tc-body .tc-tag-label .tc-remove-tag-button"];

// Empty list-after puts the stylesheets after those of the themes, so equal specificity wins
const STYLE_FIELDS = "tags: $:/tags/Stylesheet\nlist-after: \n";

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
			'<text x="11" y="17" fill="currentColor" stroke="none" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle"><$text text=<<day>>/></text>\n' +
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
 * Collect the rules of a stylesheet tiddler that colour icons with fill, keeping their @media wrappers.
 * @param {string} css - stylesheet tiddler text
 * @returns {{media: string, selectors: string[], values: string[]}[]} Fill rules, values in source order
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
			// Several fill lines are a fallback: a blank later colour is dropped and the earlier one stays
			const values = [...body.matchAll(/(?:^|[;\s])fill\s*:\s*([^;]+)/g)].map((fill) => restore(fill[1].trim()));
			if(values.length) {
				const selectors = restore(head.split("\n").filter((line) => !line.trim().startsWith("\\")).join(" "))
					.split(",").map((s) => s.trim()).filter((s) => s && !s.includes("::"));
				rules.push({ media, selectors, values });
			}
		}
	};
	scan(text.slice(text.indexOf("\n\n")), "");
	return rules;
}

/**
 * Get the last compound selector of a selector, e.g. "svg.x" from ".a > svg.x".
 * @param {string} selector - CSS selector
 * @returns {string} Subject compound selector
 */
function subject(selector) {
	return selector.trim().split(/[\s>+~]+/).pop();
}

/**
 * Restrict every svg compound of a selector to line icons, e.g. ".a svg .b" to ".a svg[stroke=...] .b".
 * @param {string} selector - CSS selector
 * @returns {string} Qualified selector
 */
function qualifySvg(selector) {
	return selector.split(/(\s*[>+~]\s*|\s+)/).map((part) => (/^svg\b/.test(part) ? part + LINE_SVG : part)).join("");
}

/**
 * Turn the fill rules of one stylesheet tiddler into stroke rules for line icons.
 * @param {string} file - path of the stylesheet tiddler
 * @returns {string[]} Stroke rules
 */
function strokeRules(file) {
	return collectFillRules(fs.readFileSync(file, "utf8")).map(({ media, selectors, values }) => {
		const targets = selectors.filter((s) => !/^img\b/.test(subject(s))).map(qualifySvg);
		if(!targets.length) {
			return "";
		}
		if(media.includes("<<")) {
			throw new Error(`Media query uses a macro of ${file}: ${media}`);
		}
		// stroke inherits like fill, so the same selectors cascade the same way, and a blank colour is dropped the same way
		const rule = `${targets.join(",\n")} { ${values.map((value) => `stroke: ${value};`).join(" ")} }`;
		return media ? `${media} {\n${rule}\n}` : rule;
	}).filter(Boolean);
}

/**
 * Write a generated stylesheet tiddler of the plugin.
 * @param {string} name - tiddler name below styles/
 * @param {string} pragma - \rules pragma line
 * @param {string} sources - names of the source stylesheets, for the header comment
 * @param {string} body - CSS text
 * @returns {void}
 */
function writeStyles(name, pragma, sources, body) {
	const text = `title: $:/plugins/tiddlywiki/lucide-core-line/styles/${name}\n${STYLE_FIELDS}\n${pragma}\n\n` +
		`/* Generated by scripts/build-lucide-core-line.mjs from ${sources}: DO NOT EDIT */\n\n${body}\n`;
	fs.mkdirSync(path.join(PLUGIN_DIR, "styles"), { recursive: true });
	fs.writeFileSync(path.join(PLUGIN_DIR, "styles", `${name}.tid`), text, "utf8");
}

/**
 * Build the stylesheets that give line icons the stroke colours vanilla, TW plugins and themes give fill icons.
 * @returns {number} Number of generated rules
 */
function buildStrokeStyles() {
	const pragma = (/^\\rules[^\n]*/m.exec(fs.readFileSync(VANILLA_BASE, "utf8")) || [""])[0];
	const vanilla = strokeRules(VANILLA_BASE);
	const sections = [
		"/* Other svgs keep their default of no stroke instead of inheriting the colours below */\nsvg:not([stroke]) { stroke: none; }",
		`/* Line icons take the stroke colour of the rules below instead of their stroke attribute */\nsvg${LINE_SVG} { stroke: inherit; }`,
		"/* Vanilla colours core icons with fill: the same selectors give line icons the same colours */\n" + vanilla.join("\n\n"),
		...PLUGIN_STYLES.map(({ name, file }) => `/* The ${name} plugin colours its icons with fill */\n` + strokeRules(file).join("\n\n")),
		`/* Tag pills and thumbnails colour icons with an inline fill and the same inline color */\n${INLINE_FILL.join(",\n")} { stroke: currentColor; }`,
		"/* The remove-tag button has the inline fill of its tag but the color of .tc-btn-invisible, and currentColor inherits as a keyword */\n" +
			`${INLINE_FILL_INHERIT.join(",\n")} { color: inherit; stroke: inherit; }`
	];
	writeStyles("stroke-colours", pragma, "vanilla's base.tid and TW plugin styles", sections.join("\n\n"));
	let count = (sections.join("\n").match(/\{ (?:stroke|color)/g) || []).length;
	OWN_STYLES.forEach(({ name, file, note }) => {
		const rules = strokeRules(file);
		const title = /^title: (.+)$/m.exec(fs.readFileSync(file, "utf8"))[1].trim();
		writeStyles(`stroke-colours-${name}`, pragma + " conditional", title,
			`/* ${note} */\n<%if [[${title}]is[shadow]] %>\n\n${rules.join("\n\n")}\n\n<%endif%>`);
		count += rules.length;
	});
	return count;
}

const { written, skipped } = buildImages();
console.log(`lucide-core-line: ${written} core images, no source for: ${skipped.join(" ")}`);
console.log(`lucide-core-line: ${buildStrokeStyles()} stroke colour rules from ${TW_DIR}`);
