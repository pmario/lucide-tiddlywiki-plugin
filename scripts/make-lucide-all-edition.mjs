import path from "path";
import {copyFilesWithExtension} from "./helpers.mjs";

// Define the directories
const __dirname = path.resolve();
const lucideDir = path.join(__dirname, "build", "lucide", "images");
const targetDir = path.join(__dirname, "edition", "lucide-all", "tiddlers", "images");

copyFilesWithExtension(lucideDir, targetDir, ".tid");
