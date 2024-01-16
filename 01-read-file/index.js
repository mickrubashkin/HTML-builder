const fs = require('fs');
const path = require('path');

const pathToFile = path.join(__dirname, './text.txt');

const readerStream = fs.createReadStream(pathToFile);
readerStream.setEncoding('UTF8');

readerStream.on('data', function (chunk) {
  console.log(chunk);
});

readerStream.on('error', function (err) {
  console.log(err.stack);
});
