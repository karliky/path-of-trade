
export default function(lib: WinAPI): Function {
  return (HWND: Number): WindowBoundingRect => {
    return lib.GetWindowRect(HWND);
  }
}

interface WindowBoundingRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
}