const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, './secret-folder');

fs.readdir(base, { withFileTypes: true }, function (err, files) {
  files.forEach((file) => {
    if (file.isFile()) {
      const filePath = path.join(base, file.name);

      fs.stat(filePath, function (err, stats) {
        const [name, ext] = file.name.split('.');
        console.log(name + ' - ' + ext + ' - ' + stats.size / 1000 + 'kb');
      });
    }
  });
});
