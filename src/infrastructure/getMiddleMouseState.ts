
export default function(lib: WinAPI): Function {
  return (): Number => {
    return lib.GetKeyState();
  }
}

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  GetKeyState: Function;
}