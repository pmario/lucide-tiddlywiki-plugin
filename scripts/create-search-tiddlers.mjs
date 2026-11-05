import fs from 'fs';
import path from 'path';
import { shortenMarkers } from './lucide-markers.mjs';

const LUCIDE_DIR = path.resolve(process.cwd(), process.env.LUCIDE_DIR || '../lucide');
const OUTPUT_DIR = process.argv[2] || './edition/lucide-all/tiddlers/search';

/**
 * Format a list field line, or nothing when the icon metadata has no such list.
 * @param {string} name - field name
 * @param {string[]|undefined} list - values from the icon .json
 * @returns {string} Field line or empty string
 */
function listField(name, list) {
	return list && list.length ? `${name}: ${list.join(' ')}\n` : '';
}

/**
 * Write a search tiddler for every Lucide icon .json file in a directory.
 * @param {string} directory - Lucide icon folder
 * @param {string} output - target folder for the .tid files
 * @param {boolean} lab - true for Lucide Lab icons
 * @returns {number} Number of written tiddlers
 */
function processFiles(directory, output, lab) {
	const files = fs.readdirSync(directory).filter((file) => path.extname(file) === '.json');

	files.forEach((file) => {
		const name = path.basename(file, '.json');
		const { tags, categories, contributors } = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));

		// Tags with spaces need brackets
		const formattedTags = shortenMarkers(tags).map(tag => tag.includes(' ') ? `[[${tag}]]` : tag);

		const content = `title: ${name}\n` +
			listField('tags', formattedTags) +
			listField('categories', shortenMarkers(categories)) +
			`lucide: yes\n` +
			(lab ? `lab: yes\n` : '') +
			listField('contributors', shortenMarkers(contributors));

		fs.writeFileSync(path.join(output, `${name}.tid`), content, 'utf8');
	});
	return files.length;
}

/**
 * Write a g:<name> tiddler for every Lucide tag group, whose tags the g: markers of the icons stand for.
 * @param {string} directory - Lucide groups folder
 * @param {string} output - target folder for the .tid files
 * @returns {number} Number of written tiddlers
 */
function processGroups(directory, output) {
	const files = fs.readdirSync(directory).filter((file) => path.extname(file) === '.json');

	files.forEach((file) => {
		const name = path.basename(file, '.json');
		const { tags } = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
		const formattedTags = (tags || []).map(tag => tag.includes(' ') ? `[[${tag}]]` : tag);
		fs.writeFileSync(path.join(output, `g_${name}.tid`), `title: g:${name}\n` + listField('tags', formattedTags), 'utf8');
	});
	return files.length;
}

// Start clean, so icons Lucide dropped do not linger
fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const icons = processFiles(path.join(LUCIDE_DIR, 'icons'), OUTPUT_DIR, false);
const lab = processFiles(path.join(LUCIDE_DIR, 'lab'), OUTPUT_DIR, true);
const groups = processGroups(path.join(LUCIDE_DIR, 'groups'), OUTPUT_DIR);
console.log(`Search tiddlers written: ${icons} icons, ${lab} lab icons, ${groups} groups`);
