const Jimp = require('jimp');
const { unlinkSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const rootPath = process.cwd();

export default function() {
  const dirname = path.resolve(rootPath);
  const SCREENSHOT_MAKER_PATH = `${dirname}\\bin\\nircmd.exe`;
  return (rect: BoundingRect, outputPath: string) => new Promise(async (resolve, reject) => {
    const screenshotPath = `${outputPath}full-screen.png`;
    const screenshotPathOutput = `${outputPath}diablo-2.png`;
    spawnSync(SCREENSHOT_MAKER_PATH, ['savescreenshotfull', screenshotPath]);
    const img = await Jimp.read(screenshotPath);
    const crop = img.crop(rect.left, rect.top, rect.width, rect.height)
    await crop.writeAsync(screenshotPathOutput);
    unlinkSync(screenshotPath);
    resolve(screenshotPathOutput);
  });
}

interface BoundingRect { 
  left: number;
  top: number;
  width: number;
  height: number;
}