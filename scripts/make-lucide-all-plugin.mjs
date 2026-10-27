import fs from "fs";
import path from "path";
import {copyFilesWithExtension} from "./helpers.mjs";

// Define the directories
const __dirname = path.resolve();
const lucideDir = path.join(__dirname, "build", "lucide", "images");
const targetDir = path.join(__dirname, "plugins", "tiddlywiki", "lucide-all", "tiddlers", "images");

// Start clean, so icons Lucide dropped do not linger
fs.rmSync(targetDir, { recursive: true, force: true });
copyFilesWithExtension(lucideDir, targetDir, ".tid");
