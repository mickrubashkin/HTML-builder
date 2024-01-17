const { mkdir, readdir, copyFile, rm } = require('node:fs/promises');
const { join } = require('node:path');

async function copyDir() {
  const src = join(__dirname, 'files');
  const dest = join(__dirname, 'files-copy');
  let isDestExists = false;

  try {
    // make dest dir
    console.log('🤖 Creating destination directory "files-copy".');
    const destDir = await mkdir(dest, { recursive: true });

    if (destDir === undefined) {
      isDestExists = true;
      console.log('🤖 Dest dir already exists.');
    } else {
      console.log('🤖 Dest dir created.');
      console.log(dest);
    }

    // read src dir
    console.log('🤖 Reading src directory "files".');
    const srcFiles = await readdir(src);

    console.log('🤖 Copying files from src to dest.');
    for (const file of srcFiles) {
      await copyFile(join(src, file), join(dest, file));
    }

    console.log('🤖 Checking files to remove.');
    // Check if we need to remove some files
    if (isDestExists) {
      const destFiles = await readdir(dest);

      for (const file of destFiles) {
        if (!srcFiles.includes(file)) {
          console.log(`🤖 ${file} was removed from src dir.`);
          rm(join(dest, file));
        }
      }
    }

    console.log('🤖 Copying finished successfully.');
  } catch (err) {
    console.log('🤖 Failed to copy dir. See more details below.');
    console.error(err);
  }
}

copyDir();
