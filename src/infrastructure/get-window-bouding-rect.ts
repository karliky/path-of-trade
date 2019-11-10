const StructType = require('ref-struct');
const ref = require('ref');

export default function(lib: WinAPI): Function {
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
  SetActiveWindow: Function;
}