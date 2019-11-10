const ffi = require('ffi');
const ref = require('ref');

export default function(): WinAPI {
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

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  SetActiveWindow: Function;
}