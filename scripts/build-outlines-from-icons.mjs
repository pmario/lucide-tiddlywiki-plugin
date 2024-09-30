// Convert "strok" icons into "outlined" icons

import { promises as fs } from 'fs';
import SVGFixer from 'oslllo-svg-fixer';
import path from 'path';

const ORIGIN_DIR = path.resolve(process.cwd(), "build", "icons");
const ICONS_DIR = path.resolve(process.cwd(), "build", "outlined-tw");

console.log(`Convert Stroke to Path and save at: ${ICONS_DIR}\n`);

async function init() {
  console.time('icon outliner');
  try {
    try {
      await fs.mkdir(ICONS_DIR);
    } catch (error) {} // eslint-disable-line no-empty

    await SVGFixer(ORIGIN_DIR, ICONS_DIR, {
      showProgressBar: true,
      traceResolution: 800,
    }).fix();

    console.timeEnd('icon outliner');
  } catch (err) {
    console.log(err);
  }
}

init();
