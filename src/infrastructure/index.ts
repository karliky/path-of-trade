import WinAPI from "./win-api";
import WaitForGameWindow from "./wait-for-game-window";
import GetGameByWindowTitle from "./get-game-by-window-title";
import GetWindowBoundingRect from "./get-window-bouding-rect";

const winAPI = WinAPI();
export const waitForGameWindow = WaitForGameWindow(winAPI);
export const getGameByWindowTitle = GetGameByWindowTitle(winAPI);
export const getWindowBoundingRect = GetWindowBoundingRect(winAPI);