// Import necessary modules
import fs from 'fs';
import path from 'path';

// Function to read JSON files and write to .tid files
async function processFiles(directory, output) {
	// Read all files in the directory
	const files = fs.readdirSync(directory);

	// Process each file
	files.forEach((file) => {
		const filePath = path.join(directory, file);

		// Check if the file is a JSON file
		if (path.extname(file) === '.json') {
			// Read the JSON file
			const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

			// Extract metadata
			const { tags, categories, contributors } = data;

			// Format tags with spaces
			const formattedTags = tags.map(tag => tag.includes(' ') ? `[[${tag}]]` : tag).join(' ');

			// Create content for the .tid file
			const content = `title: ${path.basename(file, '.json')}\n`+
				`tags: ${formattedTags}\n` +
				`categories: ${categories?.join(' ')}\n` +
				`lucide: yes\n` +
				`contributors: ${contributors?.join(' ')}\n`;

			// Write to .tid file
			const outputFilePath = path.join(output, `${path.basename(file, '.json')}.tid`);
			fs.writeFileSync(outputFilePath, content, 'utf8');
		}
	});
}

// Specify the directory containing JSON files
const directoryPath = './lucide/icons';
const outputPath = './edition/lucide-all/tiddlers/search';

// Ensure the target directory exists
if (!fs.existsSync(outputPath)) {
	fs.mkdirSync(outputPath, { recursive: true });
}

// Call the function to process files
processFiles(directoryPath, outputPath)
	.then(() => console.log('Files processed successfully'))
	.catch(err => console.error('Error processing files:', err));
