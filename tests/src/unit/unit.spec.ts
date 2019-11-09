
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

describe('Unit test - Process finding and getting info of window', () => {

  it('should fail if the game is not running', () => {
    const winAPI = <WinAPI> MockWinAPI(0);
    const getGame = GetGameByWindowTitle(winAPI);
    getGame().should.be.eql(0);
  });

  it('should get the HWND of the running game', () => {
    const winAPI = <WinAPI> MockWinAPI(5);
    const getGame = GetGameByWindowTitle(winAPI);
    getGame().should.be.eql(5);
  });

  it('should get the window bounding rect', () => {
    const mockRect = <WindowBoundingRect> { left: 16262, top: 16238, right: 14, bottom: 1 };
    const winAPI = <WinAPI> MockWinAPI(5, mockRect);
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const boundingRect = getWindowBoudingRect(HWND);
    boundingRect.left.should.be.eql(16262);
    boundingRect.top.should.be.eql(16238);
    boundingRect.right.should.be.eql(14);
    boundingRect.bottom.should.be.eql(1);
  });

  it('should get the game bounding rect, including width and height', () => {
    const mockRect = <WindowBoundingRect> { left: 16262, top: 16238, right: 14, bottom: 1 };
    const winAPI = <WinAPI> MockWinAPI(5, mockRect);
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const rect = getGameClientRect(HWND);
    rect.left.should.be.eql(16267);
    rect.top.should.be.eql(16268);
    rect.width.should.be.eql(16253);
    rect.height.should.be.eql(16367);
  });

  it('should wait until game window is active', async () => {
    const HWNDMock = 5;
    const winAPI = <WinAPI> MockWinAPI(HWNDMock);
    const waitForGameWindow = WaitForGameWindow(winAPI);
    await waitForGameWindow(HWNDMock);
  });

  it('should take desktop screenshot', async () => {
    const mockRect = <BoundingRect> { left: 0, top: 0, width: 100, height: 100 };
    const takeScreenshot = TakeScreenshotMock();
    const outputPath = `${rootPath}\\images\\unit\\`;
    const screenshotPath = <string> await takeScreenshot(mockRect, outputPath);
    const stats = await statSync(screenshotPath);
    should(stats.isFile()).be.eql(true);
  });

  it('should find where the object is located', async () => {
    const inputPath = `${rootPath}\\images\\examples\\testing-item.png`;
    const outputPath = `\\images\\unit\\`;
    const fullOutputPath = `${rootPath}${outputPath}`;
    const mockRect = <BoundingRect> { left: 0, top: 0, width: 100, height: 100 };
    const takeScreenshot = TakeScreenshotMock();
    await takeScreenshot(mockRect, `${rootPath}${outputPath}`);
    const findItemRect = FindItemRect();
    const rect = findItemRect(inputPath, fullOutputPath);
    rect.top.should.be.above(-1);
    rect.width.should.be.above(-1);
    rect.left.should.be.above(-1);
    rect.height.should.be.above(-1);
  });

  it('should crop game image using the item rect position', async () => {
    const inputPath = `${rootPath}\\images\\examples\\testing-item.png`;
    const outputPath = `\\images\\unit\\`;
    const fullOutputPath = `${rootPath}${outputPath}`;
    const mockRect = <BoundingRect> { left: 0, top: 0, width: 100, height: 100 };
    const takeScreenshot = TakeScreenshotMock();
    <string> await takeScreenshot(mockRect, `${rootPath}${outputPath}`);
    const findItemRect = FindItemRect();
    const rect = findItemRect(inputPath, fullOutputPath);
    const cropItem = CropItem();
    const resultOutputPath = `${fullOutputPath}item.png`;
    const resultPath = await cropItem(inputPath, resultOutputPath, rect);
    const parsedResult = path.parse(resultPath);
    parsedResult.base.should.be.eql('item.png');
  });

  it('should perform the whole logic of taking a screenshot and processing the item', async () => {
    const inputPath = `${rootPath}\\images\\examples\\testing-item.png`;
    const fullOutputPath = `${rootPath}\\images\\unit\\`;
    const mockRect = <WindowBoundingRect> { left: 5, top: 5, right: 5, bottom: 5 };
    const HWNDMock = 5;

    const winAPI = <WinAPI> MockWinAPI(HWNDMock, mockRect);
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const waitForGameWindow = WaitForGameWindow(winAPI);
    const takeScreenshot = TakeScreenshotMock();
    const findItemRect = FindItemRect();
    const cropItem = CropItem();
    const GetGame = GetGameByWindowTitle(winAPI);

    const processItem = <Function> ProcessItem(
      getGameClientRect,
      waitForGameWindow,
      takeScreenshot,
      findItemRect,
      cropItem,
      GetGame
    );
    const resultPath = await processItem(inputPath, fullOutputPath);
    const parsedResult = path.parse(resultPath);
    parsedResult.base.should.be.eql('item.png');
  });

  function ProcessItem(
    GetGameClientRect: Function, 
    WaitForGameWindow: Function, 
    TakeScreenshot: Function, 
    FindItemRect: Function, 
    CropItem: Function,
    GetGame: Function
  ) {
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

  function MockWinAPI(FindWindowAResult: Number, ClientRect?: WindowBoundingRect): WinAPI {
    return {
      GetForegroundWindow: () => FindWindowAResult,
      GetWindowRect: (HWND: Number, ref: Buffer) => {
        ref.writeInt32LE(ClientRect!.left, 0);
        ref.writeInt32LE(ClientRect!.top, 0x4);
        ref.writeInt32LE(ClientRect!.right, 0x8);
        ref.writeInt32LE(ClientRect!.bottom, 0xC);
      },
      FindWindowA: (): Number => FindWindowAResult,
      SetActiveWindow: () => {},
    } 
  }
  
  function TakeScreenshotMock() {
    const mockScreenshotPath = `${rootPath}\\images\\examples\\testing-item.png`;
    return (rect: BoundingRect, outputPath: string) => mockScreenshotPath;
  };

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

function FindItemRect() {
  const pyItemFinder = `${rootPath}\\..\\python\\find-contour.py`;
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
  fsExtra.emptyDirSync(`${rootPath}\\images\\unit`);
  done();
}