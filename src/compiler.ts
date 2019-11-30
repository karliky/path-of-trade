import * as path from "path";
import { copySync } from "fs-extra";

const pyLibPath = path.join(__dirname, "../python");
const pyLibOutputPath = path.join(__dirname, '..','dist','win-unpacked', 'python');
console.log('Copying', pyLibPath, 'to', pyLibOutputPath);
copySync(path.resolve(__dirname, pyLibPath), pyLibOutputPath);

const screenshotMakerPath = path.join(__dirname, "../bin");
const screenshotMakerOutputPath = path.join(__dirname, '..','dist','win-unpacked', 'bin');
console.log('Copying', screenshotMakerPath, 'to', screenshotMakerOutputPath);
copySync(path.resolve(__dirname, screenshotMakerPath), screenshotMakerOutputPath);
