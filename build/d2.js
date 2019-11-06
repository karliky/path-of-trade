"use strict";
const ffi = require('ffi');
const ref = require('ref');
require('should');
describe('Process finding and getting info of window', () => {
    it('should fail if the game is not running', () => {
        const winAPI = WinAPI();
        const getGame = GetGame(winAPI);
        getGame().should.be.eql(0);
    });
});
function GetGame(lib) {
    const GAME_WINDOW = 'Diablo II';
    return () => lib.FindWindowA(null, GAME_WINDOW);
}
function WinAPI() {
    const stringType = ref.types.CString;
    const stringPtr = ref.refType(stringType);
    const longType = ref.types.long;
    const hwndType = longType;
    const lib = new ffi.Library('user32', {
        GetForegroundWindow: ['long', []],
        GetWindowRect: ['long', [hwndType, stringPtr]],
        FindWindowA: ['long', ['string', 'string']],
        SetActiveWindow: ['long', [hwndType]],
    });
    return lib;
}
