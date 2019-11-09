
const ffi = require('ffi');
const ref = require('ref');
const { statSync, unlinkSync } = require('fs');
const path = require('path');
const StructType = require('ref-struct');
const sharp = require('sharp');
const { spawnSync } = require('child_process');
const should =  require('should');
const fsExtra = require('fs-extra');
import 'should';

const rootPath = `${__dirname}\\..\\..`;

describe('Integration test - Process finding and getting info of window', () => {

  it('should retrieve the HWND of the running game', () => {
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    getGame().should.be.above(0);
  });

  it('should get the window bounding rect', () => {
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const boundingRect = getWindowBoudingRect(HWND);
    boundingRect.left.should.be.above(0);
    boundingRect.top.should.be.above(0);
    boundingRect.right.should.be.above(0);
    boundingRect.bottom.should.be.above(0);
  });

  it('should get the game bounding rect, including width and height', () => {
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const rect = getGameClientRect(HWND);
    rect.left.should.be.above(1);
    rect.top.should.be.above(1);
    rect.width.should.be.eql(801);
    rect.height.should.be.eql(499);
  });

  it('should wait until game window is active', async () => {
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const waitForGameWindow = WaitForGameWindow(winAPI);
    await waitForGameWindow(HWND);
  });

  it('should take screenshot of the running game', async () => {
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const rect = getGameClientRect(HWND);
    const takeScreenshot = TakeScreenshot();
    const outputPath = `${rootPath}\\images\\integration\\`;
    const screenshotPath = <string> await takeScreenshot(rect, outputPath);
    const stats = await statSync(screenshotPath);
    should(stats.isFile()).be.eql(true);
  });

  it('should find an item inside the game image', async () => {
    const outputPath = `\\images\\integration\\`;
    const fullOutputPath = `${rootPath}${outputPath}`;
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const gameRect = getGameClientRect(HWND);
    const takeScreenshot = TakeScreenshot();
    const screenshotPath = <string> await takeScreenshot(gameRect, `${rootPath}${outputPath}`);
    const findItemRect = FindItemRect();
    const rect = findItemRect(screenshotPath, fullOutputPath);
    rect.top.should.be.above(-1);
    rect.width.should.be.above(1);
    rect.left.should.be.above(-1);
    rect.height.should.be.above(1);
  });

  it('should save the item crop result', async () => {
    const findItemRect = FindItemRect();
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const cropItem = CropItem();
    const takeScreenshot = TakeScreenshot();

    const outputPath = `\\images\\integration\\`;
    const fullOutputPath = `${rootPath}${outputPath}`;

    const HWND = <Number> getGame();
    const rect = getGameClientRect(HWND);
    const screenshotPath = <string> await takeScreenshot(rect, `${rootPath}${outputPath}`);
    const itemPosition = findItemRect(screenshotPath, fullOutputPath);
    const resultOutputPath = `${fullOutputPath}item.png`;
    const resultPath = await cropItem(screenshotPath, resultOutputPath, itemPosition);
    const parsedResult = path.parse(resultPath);
    parsedResult.base.should.be.eql('item.png');
  });

  beforeEach((done) => _cleanImages(done));
  after((done) => _cleanImages(done));

});

function GetGameByWindowTitle(lib: WinAPI) {
  const GAME_WINDOW = 'Diablo II';
  return (): Number => lib.FindWindowA(null, GAME_WINDOW);
}

interface WindowBoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface BoundingRect { 
  left: number;
  top: number;
  width: number;
  height: number;
}

function GetWindowBoudingRect(lib: WinAPI): Function {
  const longType = ref.types.long;
  const windStruct = StructType({
    left: longType,
    top: longType,
    right: longType,
    bottom: longType
  });

  return (HWND: Number): WindowBoundingRect => {
    const windRect = new windStruct;
    lib.GetWindowRect(HWND, windRect.ref());
    return windRect; 
  }
}

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  SetActiveWindow: Function;
}

function WinAPI(): WinAPI {
  const stringType = ref.types.CString;
  const stringPtr = ref.refType(stringType);
  const longType = ref.types.long;
  const hwndType = longType;

  return new ffi.Library('user32', {
    GetForegroundWindow: ['long', []],
    GetWindowRect: ['long', [hwndType, stringPtr]],
    FindWindowA: ['long', ['string', 'string']],
    SetActiveWindow: ['long', [hwndType]],
  });
}

function GetGameClientRect(GetWindowBoudingRect: Function) {
  const VERTICAL_OFFSET = 30;
  const BOTTOM_ADJUSTMENT = 100;
  const HORIZONTAL_OFFSET = 5;
  return (HWND: Number) => {
    const boundingRect = GetWindowBoudingRect(HWND);
    const width = boundingRect.right - boundingRect.left;
    const height = boundingRect.bottom - boundingRect.top;
    return { 
      left: boundingRect.left + HORIZONTAL_OFFSET, 
      top: boundingRect.top + VERTICAL_OFFSET, 
      width: Math.abs(width - HORIZONTAL_OFFSET), 
      height: Math.abs(height - VERTICAL_OFFSET - BOTTOM_ADJUSTMENT)
    };
  };
}

function WaitForGameWindow(lib: WinAPI) {
  return async (HWND:Number) => new Promise((resolve) => {
    if (lib.GetForegroundWindow() === HWND) return resolve();
    const interval = <any> setInterval(() => windowDetector(interval, resolve, HWND), 100);
  });

  function windowDetector(interval: any, resolve: Function, HWND: Number) {
    if (lib.GetForegroundWindow() === HWND) {
      clearInterval(interval);
      resolve();
    }
  }
}

function TakeScreenshot() {
  const dirname = path.resolve(rootPath);
  const SCREENSHOT_MAKER_PATH = `${dirname}\\..\\bin\\nircmd.exe`;
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

function FindItemRect() {
  const dirname = path.resolve(rootPath);
  const pyItemFinder = `${dirname}\\..\\python\\find-contour.py`;
  return (inputPath: string, outputPath: string): BoundingRect => {
    try {
      const spawn = spawnSync('python', [ pyItemFinder, '--input', inputPath, '--output', outputPath ]);
      return JSON.parse(spawn.stdout.toString());
    } catch (error) {
      console.error('error', error.message);
      return { top: 0, left: 0, width: 0, height: 0 };
    }
  }
}

function CropItem() {
  return (inputPath: string, outputPath: string, rect: BoundingRect) => new Promise((resolve, reject) => {
    return sharp(inputPath)
      .extract(rect)
      .toFile(outputPath, function(err: Error) {
        if (err) return reject(err);
        resolve(outputPath);
      });
  })
}

function _cleanImages(done: Function) {
  fsExtra.emptyDirSync(`${rootPath}\\images\\integration`);
  done();
}