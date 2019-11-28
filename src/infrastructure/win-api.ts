const addon = require('winapi');

export default function(): WinAPI {
  return addon;
}

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
}