
export default function(lib: WinAPI): Function {
  const GAME_WINDOW = 'Diablo II';
  return (): Number => lib.FindWindowA(null, GAME_WINDOW);
}

interface WinAPI {
  GetForegroundWindow: Function;
  GetWindowRect: Function;
  FindWindowA: Function;
  SetActiveWindow: Function;
}