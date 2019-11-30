import { 
  cropItem as CropItem,
  findItemRect as FindItemRect,
  takeScreenshot as TakeScreenshot,
  getGameClientRect as GetGameClientRect,
  waitForGame as WaitForGameWindow,
  getGame as GetGame,
  getMiddleMouseState as GetMiddleMouseStateService
} from "../domain/";

import processItem from "./processItem";
import getMiddleMouseState from "./getMiddleMouseState";

export const ProcessItem = processItem(GetGameClientRect,
  WaitForGameWindow,
  TakeScreenshot,
  FindItemRect,
  CropItem,
  GetGame)

export const GetMiddleMouseState = getMiddleMouseState(GetMiddleMouseStateService);