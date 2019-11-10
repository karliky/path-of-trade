const sharp = require('sharp');
const { unlinkSync } = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');

const rootPath = process.cwd();

export default function() {
  const dirname = path.resolve(rootPath);
  const SCREENSHOT_MAKER_PATH = `${dirname}\\bin\\nircmd.exe`;
  return (rect: BoundingRect, outputPath: string) => new Promise((resolve, reject) => {
    const screenshotPath = `${outputPath}full-screen.png`;
    const screenshotPathOutput = `${outputPath}diablo-2.png`;
    spawnSync(SCREENSHOT_MAKER_PATH, ['savescreenshotfull', screenshotPath]);
    sharp(screenshotPath)
    .extract(rect)
    .toFile(screenshotPathOutput, handleScreenshot(resolve, reject, screenshotPath, screenshotPathOutput));
  });

  function handleScreenshot(resolve: Function, reject: Function, screenshotPath: string, screenshotPathOutput: string) {
    return (err: Error) => {
      if (err) return reject(err);
      try {
        unlinkSync(screenshotPath);
      } catch (error) {
        console.error('Could not delete file', error);
      } finally {
        resolve(screenshotPathOutput);
      }
    }
  }
}

interface BoundingRect { 
  left: number;
  top: number;
  width: number;
  height: number;
}