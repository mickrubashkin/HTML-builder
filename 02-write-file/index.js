const fs = require('fs');
const path = require('path');
const readline = require('node:readline');

const pathToFile = path.join(__dirname, './output.txt');
const file = fs.createWriteStream(pathToFile);

const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt(
  '👋 Hey there! Please send us a message!\n🤖 Press ctrl+c or type "exit" to finish.\n',
);
rl.prompt();

let lineCount = 0;
let charCount = 0;
rl.on('line', function (input) {
  if (input === 'exit') {
    file.end();
    rl.close();
  } else {
    lineCount += 1;
    charCount += input.length;
    file.write(input + '\n');
  }
});

process.on('exit', function () {
  const plural = lineCount > 1 ? 's' : '';
  console.log(
    `✅ Your message received.\n📝 Total ${lineCount} line${plural} and ${charCount} chars.\n🗂 Written to the "${pathToFile}"\n`,
  );
});
