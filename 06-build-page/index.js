const { mkdir, readdir, copyFile, rm } = require('node:fs/promises');
const { join, extname } = require('node:path');
const { createReadStream, createWriteStream } = require('node:fs');

async function copyDir(src, dest) {
  let isDestExists = false;
  const srcAbsPath = join(__dirname, src);
  const destAbsPath = join(__dirname, dest);

  try {
    // make dest dir
    console.log('🤖 Creating destination directory', dest);
    const destDir = await mkdir(destAbsPath, { recursive: true });

    if (destDir === undefined) {
      isDestExists = true;
    }

    // read src dir
    const srcDirents = await readdir(srcAbsPath, { withFileTypes: true });
    const srcNames = srcDirents.map((dirent) => dirent.name);

    for await (const dirent of srcDirents) {
      if (dirent.isDirectory()) {
        console.log(`🤖 Copying files from src/${dirent.name} subfolder...`);
        const newSrc = join(src, dirent.name);
        const newDest = join(dest, dirent.name);
        await copyDir(newSrc, newDest);
      } else {
        console.log(`🤖 Copying ${dirent.name}...`);
        await copyFile(
          join(srcAbsPath, dirent.name),
          join(destAbsPath, dirent.name),
        );
      }
    }

    console.log('🤖 Checking files to remove.');
    // Check if we need to remove some files
    if (isDestExists) {
      const destDirents = await readdir(destAbsPath, { withFileTypes: true });

      for (const dirent of destDirents) {
        if (!srcNames.includes(dirent.name)) {
          console.log(`🤖 ${dirent.name} removed from src dir.`);
          rm(join(destAbsPath, dirent.name), { recursive: true, force: true });
        }
      }
    }
    console.log('======================');
    console.log(`🤖 Copying ${src} to ${dest} finished.`);
    console.log('======================');
  } catch (err) {
    console.log(`🤖 Failed to copy ${src} to ${dest}. See more details below.`);
    console.error(err);
  }
}

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

async function mergeStyles(src, dest, fileName = 'style.css') {
  const chunks = await filesToArray(join(__dirname, src));

  const writable = createWriteStream(join(__dirname, dest, fileName));
  for await (const chunk of chunks) {
    writable.write(chunk);
  }
  writable.end(() => {
    console.log('======================');
    console.log('Styles merged.');
    console.log('======================');
  });
}

async function buildHtml(componentsDir, template) {
  const readable = createReadStream(join(__dirname, template));
  const templateString = await readableToString(readable);

  const matches = templateString.match(/{{(\w+)}}/gm);
  const placeholders = matches.map((match) => {
    return match.replace(/{|}/gm, '');
  });

  let components = [];

  for (const placeholder of placeholders) {
    const componentName = placeholder + '.html';
    const readable = createReadStream(
      join(__dirname, componentsDir, componentName),
    );
    const compStr = await readableToString(readable);
    let component = {};
    component[placeholder] = compStr;
    components.push(component);
  }

  let newHtml = templateString;

  for (const component of components) {
    const name = '{{' + Object.keys(component)[0] + '}}';
    const str = Object.values(component)[0];

    newHtml = newHtml.replace(name, str);
  }

  const writable = createWriteStream(
    join(__dirname, 'project-dist', 'index.html'),
  );

  writable.write(newHtml);
  writable.end(() => {
    console.log('======================');
    console.log('index.html built.');
    console.log('======================');
  });
}

async function bundle() {
  await copyDir('assets', 'project-dist/assets');
  await mergeStyles('styles', 'project-dist', 'style.css');
  await buildHtml('components', 'template.html');
}

bundle();
