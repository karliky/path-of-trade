const tesseract = require("node-tesseract-ocr")
 
const config = {
  lang: "eng",
  oem: 1,
  psm: 1,
}
 
tesseract.recognize("./images/d2items/trang-ouls.png", config)
  .then(text => {
    const finalText = normalizeText(text);
    console.log("Result:", finalText)
  })
  .catch(error => {
    console.log(error.message)
  })

  function normalizeText(text) {
    const lines = text.split('\r\n');
    return lines.map((line) => cleanText(line)).join('\n');
  }

  function cleanText(line) {
    let text = line.replace('| ', '');
    text = text.replace('EresreAL', 'Ethereal');
    text = text.replace('Requirep', 'Required');
    text = text.replace('Requikep', 'Required');
    text = text.replace('Requirsp', 'Required');
    text = text.replace('Requinsp', 'Required');
    text = text.replace('HaNnp', 'Hand');
    text = text.replace('DusasILITY', 'Durability');
    text = text.replace('Derense', 'Defense');
    text = text.replace('SrReNGTHL', 'strength');
    text = text.replace('er-Tke', 'of the');
    text = text.replace('caaress', 'charges');
    text = text.replace('-- ', '');
    text = text.replace('[i]', '');
    text = text.replace(':', '');
    text = text.replace('*', '');
    text = text.replace('resistannces', 'resistances');
    text = text.replace('@r/', 'of');
    if (text.includes('ENHANCED') || text.includes('Engance')) text = _getDamage(text);
    if (text.includes('Cast"RaTe')) text = _getCastRate(text);
    return text.toLowerCase().capitalize().trim();
  }

  function _getDamage(ed) {
    const numberPattern = /\d+/g;
    const enhanced = ed.match(numberPattern);
    return `${'0' in enhanced ? enhanced[0] : 0}% Enhanced damage`;
  }

  function _getCastRate(ed) {
    const numberPattern = /\d+/g;
    const castrate = ed.match(numberPattern);
    return `${'0' in castrate ? castrate[0] : 0}% Faster cast rate`;
  }



  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
  }