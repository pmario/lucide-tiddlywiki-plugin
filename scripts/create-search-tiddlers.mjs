import fs from 'fs';
import path from 'path';

const LUCIDE_DIR = path.resolve(process.cwd(), process.env.LUCIDE_DIR || '../lucide');
const OUTPUT_DIR = './edition/lucide-all/tiddlers/search';

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

		// Format tags with spaces
		const formattedTags = tags.map(tag => tag.includes(' ') ? `[[${tag}]]` : tag).join(' ');

		const content = `title: ${name}\n` +
			`tags: ${formattedTags}\n` +
			`categories: ${categories?.join(' ')}\n` +
			`lucide: yes\n` +
			(lab ? `lab: yes\n` : '') +
			`contributors: ${contributors?.join(' ')}\n`;

		fs.writeFileSync(path.join(output, `${name}.tid`), content, 'utf8');
	});
	return files.length;
}

// Start clean, so icons Lucide dropped do not linger
fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const icons = processFiles(path.join(LUCIDE_DIR, 'icons'), OUTPUT_DIR, false);
const lab = processFiles(path.join(LUCIDE_DIR, 'lab'), OUTPUT_DIR, true);
console.log(`Search tiddlers written: ${icons} icons, ${lab} lab icons`);
