
const ffi = require('ffi');
const ref = require('ref');
const StructType = require('ref-struct');
import 'should';

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
    rect.width.should.be.eql(-16253);
    rect.height.should.be.eql(-16267);
  });

  it('should wait until game window is active', async () => {
    const HWNDMock = 5;
    const winAPI = <WinAPI> MockWinAPI(HWNDMock);
    const waitForGameWindow = WaitForGameWindow(winAPI);
    await waitForGameWindow(HWNDMock);
  });

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
});


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
    rect.height.should.be.eql(599);
  });

  it('should wait until game window is active', async () => {
    const winAPI = <WinAPI> WinAPI();
    const getGame = GetGameByWindowTitle(winAPI);
    const HWND = <Number> getGame();
    const waitForGameWindow = WaitForGameWindow(winAPI);
    await waitForGameWindow(HWND);
  });

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
  const HORIZONTAL_OFFSET = 5;
  return (HWND: Number) => {
    const boundingRect = GetWindowBoudingRect(HWND);
    const width = boundingRect.right - boundingRect.left;
    const height = boundingRect.bottom - boundingRect.top;
    return { 
      left: boundingRect.left + HORIZONTAL_OFFSET, 
      top: boundingRect.top + VERTICAL_OFFSET, 
      width: width - HORIZONTAL_OFFSET, 
      height: height - VERTICAL_OFFSET 
    };
  };
}

function WaitForGameWindow(lib: WinAPI) {
  return async (HWND:Number) => new Promise((resolve) => {
    const interval = <any> setInterval(() => windowDetector(interval, resolve, HWND), 100);
  });

  function windowDetector(interval: any, resolve: Function, HWND: Number) {
    if (lib.GetForegroundWindow() === HWND) {
      clearInterval(interval);
      resolve();
    }
  }
}