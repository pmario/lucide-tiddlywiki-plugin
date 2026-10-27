// Remove carriage returns from the built docs; TiddlyWiki writes one after its "saved from url" comment

import fs from "fs";
import path from "path";

const DOCS_DIR = path.resolve(process.cwd(), "docs");

/**
 * Rewrite every HTML file in a folder with LF line endings only.
 * @param {string} dir - folder to clean
 * @returns {string[]} Names of the files that held a carriage return
 */
function stripCarriageReturns(dir) {
	return fs.readdirSync(dir).filter((name) => name.endsWith(".html")).filter((name) => {
		const file = path.join(dir, name);
		const text = fs.readFileSync(file, "utf8");
		if(!text.includes("\r")) {
			return false;
		}
		fs.writeFileSync(file, text.replace(/\r/g, ""), "utf8");
		return true;
	});
}

const fixed = stripCarriageReturns(DOCS_DIR);
console.log(`strip-cr: ${fixed.length ? fixed.join(" ") : "no carriage returns"}`);
