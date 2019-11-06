'use strict';

const ffi = require('ffi');
const ref = require('ref');
const sharp = require('sharp');
const StructType = require('ref-struct');
const { spawnSync } = require('child_process');


const stringType = ref.types.CString;
const stringPtr = ref.refType(stringType);
const longType = ref.types.long;
const hwndType = longType;

const takeScreenshotPath = `${__dirname}/bin/nircmd.exe`;

const lib = new ffi.Library('user32', {
    GetForegroundWindow: ['long', []],
    GetWindowRect: [
        'long', [hwndType, stringPtr],
    ],
    FindWindowA: [
        'long', ["string", "string"]
    ]
});

var windStruct = StructType({
    left: longType,
    top: longType,
    right: longType,
    bottom: longType
})  

const hwnd = lib.FindWindowA(null, 'Diablo II');
const windRect = new windStruct;

console.log('hwnd ', hwnd);
console.log('GetWindowRect ', lib.GetWindowRect(hwnd, windRect.ref()));
console.log('WindStruct ', windRect.left, windRect.top, windRect.right, windRect.bottom);

const width = windRect.right - windRect.left;
const height = windRect.bottom - windRect.top;

console.log('Window size', width, height);

while (lib.GetForegroundWindow() !== hwnd) {
    console.log('Waiting for game to be active', new Date);
}

const screenshotPath = `${__dirname}/images/output/full-screen.png`;
const screenshotPathOutput = `${__dirname}/images/output/diablo-2.png`;
spawnSync(takeScreenshotPath, ['savescreenshotfull', screenshotPath]);

sharp(screenshotPath)
  .extract(getGameClientRect())
  .toFile(screenshotPathOutput, function(err) {
    console.log('Image extracted!', screenshotPathOutput);
  });

function getGameClientRect() {
    const VERTICAL_OFFSET = 30;
    const HORIZONTAL_OFFSET = 5;
    return { left: windRect.left + HORIZONTAL_OFFSET, top: windRect.top + VERTICAL_OFFSET, width: width - HORIZONTAL_OFFSET, height: height - VERTICAL_OFFSET }
}
