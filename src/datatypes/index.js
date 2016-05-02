import _ from 'lodash';
import requireDirectory from 'require-directory';

function renamer(name) {
  return _.camelCase(name);
}

export default requireDirectory(module, __dirname, { rename: renamer });
