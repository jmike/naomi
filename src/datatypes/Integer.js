import _ from 'lodash';
import NumberType from './Number';

class IntegerType extends NumberType {

  constructor() {
    super();
  }

  set autoinc(v: boolean): void {
    this.props.autoinc = v;
  }

  toJoi(): Object {
    let joi = super.toJoi().strict(true);
    joi = joi.integer();

    return joi;
  }

  toJSON(): Object {
    return _.chain(this.props)
      .clone()
      .assign({type: 'integer'})
      .value();
  }

}

export default IntegerType;
