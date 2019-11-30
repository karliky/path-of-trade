export {}

import { ProcessItem, GetMiddleMouseState } from './actions/index';

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, (process.versions as any)[type]);
  }
  // Load Vue
  require('./index.js');
});

declare global {
  interface Window {
    ProcessItem: Function;
    GetMiddleMouseState: Function;
    srcPath: Object;
  }
}

window.ProcessItem = ProcessItem;
window.GetMiddleMouseState = GetMiddleMouseState;
window.srcPath = `${process.cwd()}/build/`;