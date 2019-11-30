import {
  waitForGameWindow,
  getGameByWindowTitle,
  getWindowBoundingRect,
  getMiddleMouseState as GetMiddleMouseState
} from "../infrastructure/";

import TakeScreenshot from "./take-screenshot";
import FindItemRect from "./find-item-rect";
import CropItem from "./crop-item";
import GetGameClientRect from "./get-game-client-rect";

export const cropItem = CropItem();
export const findItemRect = FindItemRect();
export const takeScreenshot = TakeScreenshot();
export const getGameClientRect = GetGameClientRect(getWindowBoundingRect);
export const waitForGame = waitForGameWindow;
export const getGame = getGameByWindowTitle;
export const getMiddleMouseState = GetMiddleMouseState;