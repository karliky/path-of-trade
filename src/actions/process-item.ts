
export default function(
  GetGameClientRect: Function, 
  WaitForGameWindow: Function, 
  TakeScreenshot: Function, 
  FindItemRect: Function, 
  CropItem: Function,
  GetGame: Function) {
    return async (imagePath: string, outputPath: string) => {
      const HWND = <Number> GetGame();
      await WaitForGameWindow(HWND);
      const rect = GetGameClientRect(HWND);
      const gameScreenshotPath = <string> await TakeScreenshot(rect, outputPath);
      const itemRect = FindItemRect(gameScreenshotPath, outputPath);
      const resultOutputPath = `${outputPath}item.png`;
      return await CropItem(imagePath, resultOutputPath, itemRect);
    }
  }