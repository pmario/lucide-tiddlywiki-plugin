// Convert Lucide "stroke" icons, including Lucide Lab, into "outlined" icons

import fs from "fs";
import path from "path";
import SVGFixer from "oslllo-svg-fixer";

const LUCIDE_DIR = path.resolve(process.cwd(), process.env.LUCIDE_DIR || "../lucide");
const OUTLINED_DIR = path.resolve(process.cwd(), "build", "outlined-lucide");
// Lucide Lab lives in the "lab" folder of the main repo since July 2026
const ICON_SETS = ["icons", "lab"];

if (!fs.existsSync(path.join(LUCIDE_DIR, "lab"))) {
	throw new Error(`No up-to-date Lucide repository at ${LUCIDE_DIR}. Clone it there or set LUCIDE_DIR.`);
}

console.log(`Convert Lucide strokes to paths and save at: ${OUTLINED_DIR}\n`);
fs.rmSync(OUTLINED_DIR, { recursive: true, force: true });

console.time("icon outliner");
for (const set of ICON_SETS) {
	const outlinedDir = path.join(OUTLINED_DIR, set);
	fs.mkdirSync(outlinedDir, { recursive: true });
	await SVGFixer(path.join(LUCIDE_DIR, set), outlinedDir, {
		showProgressBar: true,
		traceResolution: 800,
	}).fix();
}
console.timeEnd("icon outliner");
