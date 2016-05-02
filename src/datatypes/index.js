import requireDirectory from 'require-directory';

function renamer(name) {
  return name.toLowerCase();
}

export default requireDirectory(module, __dirname, { rename: renamer });
