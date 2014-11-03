/*!
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Christian Hoffmeister
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
  var doc = app.activeDocument;
  var ab = doc.artboards[0];
  var width = ab.artboardRect[2] - ab.artboardRect[0];
  var height = ab.artboardRect[1] - ab.artboardRect[3];

  if (width != 1024 || height != 1024) {
    alert('Your document has size ' + width + 'x' + height + ' pixels, but must have size 1024x1024 pixels');
    return;
  }

  var file = File.saveDialog('Choose an .icns file to export to');
  if (!file || !file.toString().match(/\.icns$/)) {
    alert('You must choose an .icsn file');
    return;
  }

  var formats = [
    { type: 'icp4', size: 16 },
    { type: 'icp5', size: 32 },
    { type: 'icp6', size: 64 },
    { type: 'ic07', size: 128 },
    { type: 'ic08', size: 256 },
    { type: 'ic09', size: 512 },
    { type: 'ic10', size: 1024 },
    { type: 'ic11', size: 32 },
    { type: 'ic12', size: 64 },
    { type: 'ic13', size: 256 },
    { type: 'ic14', size: 512 }
  ]

  var totalLength = 0;
  for (var i = 0; i < formats.length; i++) {
    var format = formats[i];
    var filePng = new File(Folder.temp + '/icns-export-temp.png');
    exportAsPng(filePng, format.size);
    format.png = readFile(filePng);
    totalLength += format.png.length;
  }
  openFile(file, 'w');

  writeString(file, 'icns');
  writeInt(file, 8 + 8 * formats.length + totalLength);
  for (var i = 0; i < formats.length; i++) {
    var format = formats[i];
    writeString(file, format.type);
    writeInt(file, format.png.length + 8);
    writeString(file, format.png);
  }

  closeFile(file);

  function writeInt(file, i) {
    var a = String.fromCharCode((i >> 24) & 255);
    var b = String.fromCharCode((i >> 16) & 255);
    var c = String.fromCharCode((i >> 8) & 255);
    var d = String.fromCharCode((i >> 0) & 255);
    return file.write(a + b + c + d);
  }

  function writeString(file, str) {
    file.write(str);
  }

  function readFile(file) {
    openFile(file, 'r');
    var result = file.read();
    closeFile(file);
    file.remove();
    return result;
  }

  function openFile(file, mode) {
    file.encoding = 'BINARY';
    if (!file.open(mode)) throw new Error('Could not read ' + file);
  }

  function closeFile(file) {
    file.close();
  }

  function exportAsPng(file, size) {
    var expType = ExportType.PNG24;
    var exp = new ExportOptionsPNG24();
    exp.antiAliasing = true;
    exp.transparency = this.transparency;
    exp.artBoardClipping = true;
    exp.horizontalScale = size / 1024.0 * 100.0;
    exp.verticalScale = size / 1024.0 * 100.0;
    exp.transparency = true;

    doc.exportFile(file, expType, exp);
  }
})();
