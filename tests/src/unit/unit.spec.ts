
const { statSync } = require('fs');
const path = require('path');
const should =  require('should');
const fsExtra = require('fs-extra');
import 'should';

import ProcessItem from "../../../src/actions/process-item";

import CropItem from "../../../src/domain/crop-item";
import FindItemRect from "../../../src/domain/find-item-rect";
import GetGameClientRect from "../../../src/domain/get-game-client-rect";

import WinAPI from "../../../src/infrastructure/win-api";
import GetGameByWindowTitle from "../../../src/infrastructure/get-game-by-window-title";
import GetWindowBoudingRect from "../../../src/infrastructure/get-window-bouding-rect";
import WaitForGameWindow from "../../../src/infrastructure/wait-for-game-window";

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

  function MockWinAPI(FindWindowAResult: Number, ClientRect?: WindowBoundingRect): WinAPI {
    return {
      GetForegroundWindow: () => FindWindowAResult,
      GetWindowRect: (HWND: Number, ref: Buffer) => {
        return {
          left: ClientRect!.left,
          top: ClientRect!.top,
          right: ClientRect!.right,
          bottom: ClientRect!.bottom
        };
      },
      FindWindowA: (): Number => FindWindowAResult,
      GetKeyState: (): Number => FindWindowAResult
    } 
  }
  
  function TakeScreenshotMock() {
    const mockScreenshotPath = `${rootPath}\\images\\examples\\testing-item.png`;
    return (rect: BoundingRect, outputPath: string) => mockScreenshotPath;
  };

  beforeEach((done) => _cleanImages(done));
  after((done) => _cleanImages(done));
});

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  GetKeyState: Function;
}

function _cleanImages(done: Function) {
  fsExtra.emptyDirSync(`${rootPath}\\images\\unit`);
  done();
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