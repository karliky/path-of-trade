import * as path from "path";
import { copySync } from "fs-extra";

const indexPath = path.join(__dirname, "../ui/index.html");
const outputPath = path.join(__dirname, "../build/index.html");

copySync(path.resolve(__dirname, indexPath), outputPath);
