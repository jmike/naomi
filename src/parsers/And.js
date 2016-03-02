import _ from 'lodash';
import type from 'type-of';
import Selection from './Selection';

class And {

  static parse(v: Array): Array {
    if (!_.isArray(v)) {
      throw new TypeError(`Invalid and expression; expected array, received ${type(v)}`);
    }

    if (v.length === 0) {
      throw new TypeError(`Invalid and expression; array cannot be empty`);
    }

    return ['AND'].concat(v.map((e) => {
      const selection = Selection.parse(e);
      return selection[1]; // remove the "SELECTION" part
    }));
  }

}

export default And;
