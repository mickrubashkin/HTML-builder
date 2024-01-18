const { createReadStream, createWriteStream } = require('node:fs');
const { readdir } = require('node:fs/promises');
const { join, extname } = require('node:path');

async function readableToString(stream) {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk;
    });
    stream.on('end', () => {
      resolve(data);
    });
    stream.on('error', (err) => {
      reject(`Error converting stream - ${err}`);
    });
  });
}

async function filesToArray(src) {
  const buffer = [];

  const srcFiles = await readdir(src, { withFileTypes: true });

  for await (const dirent of srcFiles) {
    if (!dirent.isFile() || extname(dirent.name) !== '.css') {
      continue;
    }

    const readable = createReadStream(join(src, dirent.name), {
      encoding: 'utf8',
    });

    const data = await readableToString(readable);
    buffer.push(data);
  }

  return new Promise((resolve) => {
    resolve(buffer);
  });
}

async function build(src, dest) {
  const chunks = await filesToArray(src);

  const writable = createWriteStream(join(dest, 'bundle.css'));
  for await (const chunk of chunks) {
    writable.write(chunk);
  }
  writable.end(() => {
    console.log('done');
  });
}

const src = join(__dirname, 'styles');
const dest = join(__dirname, 'project-dist');

build(src, dest);
