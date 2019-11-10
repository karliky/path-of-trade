

export default function(lib: WinAPI) {
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

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  SetActiveWindow: Function;
}