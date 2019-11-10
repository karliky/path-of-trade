const path = require('path');
const { spawnSync } = require('child_process');
const rootPath = process.cwd();

export default function() {
  const dirname = path.resolve(rootPath);
  const pyItemFinder = `${dirname}\\python\\find-contour.py`;
  return (inputPath: string, outputPath: string): BoundingRect => {
      try {
      const spawn = spawnSync('python', [ pyItemFinder, '--input', inputPath, '--output', outputPath ]);
      return JSON.parse(spawn.stdout.toString());
      } catch (error) {
      console.error('Find item rect error', error.message);
      return { top: 0, left: 0, width: 0, height: 0 };
      }
  }
}

interface BoundingRect { 
  left: number;
  top: number;
  width: number;
  height: number;
}