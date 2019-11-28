import { 
  cropItem as CropItem,
  findItemRect as FindItemRect,
  takeScreenshot as TakeScreenshot,
  getGameClientRect as GetGameClientRect,
  waitForGame as WaitForGameWindow,
  getGame as GetGame
} from "../domain/";

import processItem from "./process-item";

export const ProcessItem = processItem(GetGameClientRect,
  WaitForGameWindow,
  TakeScreenshot,
  FindItemRect,
  CropItem,
  GetGame)