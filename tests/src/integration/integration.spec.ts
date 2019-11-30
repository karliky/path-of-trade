
const { statSync } = require('fs');
const path = require('path');
const should =  require('should');
const fsExtra = require('fs-extra');

import ProcessItem from "../../../src/actions/process-item";

import 'should';
import CropItem from "../../../src/domain/crop-item";
import FindItemRect from "../../../src/domain/find-item-rect";
import TakeScreenshot from "../../../src/domain/take-screenshot";
import GetGameClientRect from "../../../src/domain/get-game-client-rect";

import WinAPI from "../../../src/infrastructure/win-api";
import GetGameByWindowTitle from "../../../src/infrastructure/get-game-by-window-title";
import GetWindowBoudingRect from "../../../src/infrastructure/get-window-bouding-rect";
import WaitForGameWindow from "../../../src/infrastructure/wait-for-game-window";

const rootPath = `${__dirname}/../..`;

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
    const outputPath = `${rootPath}/images/integration/`;
    const screenshotPath = <string> await takeScreenshot(rect, outputPath);
    const stats = await statSync(screenshotPath);
    should(stats.isFile()).be.eql(true);
  });

  it('should find an item inside the game image', async () => {
    const outputPath = `/images/integration/`;
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

    const outputPath = `/images/integration/`;
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

  it('should perform the whole logic of taking a screenshot and processing the item', async () => {
    const inputPath = `${rootPath}\\images\\examples\\testing-item.png`;
    const fullOutputPath = `${rootPath}\\images\\unit\\`;

    const winAPI = <WinAPI> WinAPI();
    const getWindowBoudingRect = GetWindowBoudingRect(winAPI);
    const getGameClientRect = GetGameClientRect(getWindowBoudingRect);
    const waitForGameWindow = WaitForGameWindow(winAPI);
    const takeScreenshot = TakeScreenshot();
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

  beforeEach((done) => _cleanImages(done));
  after((done) => _cleanImages(done));

});

function _cleanImages(done: Function) {
  fsExtra.emptyDirSync(`${rootPath}/images/integration`);
  done();
}

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  GetKeyState: Function;
}

interface WindowBoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
