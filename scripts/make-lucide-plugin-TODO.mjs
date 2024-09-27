import fs from "fs";
import path from "path";

// Define the directories
const __dirname = path.resolve();
const lucideDir = path.join(__dirname, "build", "lucide", "images");
const coreImagesDir = path.join(__dirname, "build", "core", "images");
const targetDir = path.join(__dirname, "plugins", "tiddlywiki", "lucide-all", "tiddlers", "images");
const configDir = path.join(__dirname, "scripts", "config");

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
	fs.mkdirSync(targetDir, { recursive: true });
}

// Read the JSON configuration file from the scripts/config directory
const configFile = path.join(configDir, "tiddlywiki-mappings.json");
const config = JSON.parse(fs.readFileSync(configFile, "utf8"));

/**
 * Extracts and formats the title from the configuration key.
 * @param {string} key - The configuration key.
 * @returns {string} - The formatted title.
 */
const getTitle = (key) => {
	return key;
};

/**
 * Extracts and formats the title from the configuration key.
 * @param {string} key - The configuration key.
 * @returns {string} - The formatted title.
 */
const getClass = (key) => {
	const parts = key.split("/");
	return `${parts[parts.length - 1]}`;
};

/**
 * Processes and manipulates files based on the configuration.
 * @param {Object} config - The JSON configuration object.
 */
const processFiles = (config) => {
	Object.entries(config).forEach(([key, value]) => {
		const fileName = value.lucide;
		const customDir = value.customDir;
		const sourceDir = customDir ? coreImagesDir : lucideDir;
		const sourcePath = path.join(sourceDir, fileName);
		const targetPath = path.join(targetDir, fileName);

		// Check if source file exists
		if (fs.existsSync(sourcePath)) {
			let content = fs.readFileSync(sourcePath, "utf8");
			const title = getTitle(key);
			const tcClass = getClass(key);

			// Replace title in the content
			content = content.replace(/title:\s*.*\n/, `title: ${title}\n`);
			content = content.replace(/tags:\s*.*\n/, `tags: $:/tags/Image/Lucide $:/tags/Image\n`);

			// Extend class attribute in the content
			const classList = value.classes.map(cls => cls.replace("$(title)$", tcClass)).join(" ");
			content = content.replace(/tc-image-button/, `${classList}`);

			// Write the manipulated content to the target directory
			fs.writeFileSync(targetPath, content, "utf8");
			console.log(`Saved ${sourcePath} to ${targetPath}`);
		} else {
			console.error(`Source file not found: ${sourcePath}`);
		}
	});
};

// Execute the function to process files
processFiles(config);
