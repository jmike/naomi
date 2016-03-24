import requireDirectory from 'require-directory';

function renamer(name) {
  return name.toLowerCase();
}

const hash = requireDirectory(module, __dirname, {
  rename: renamer,
  recurse: false
});

export default hash;
