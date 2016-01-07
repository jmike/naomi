import NumberType from './Number';

class IntegerType extends NumberType {

  constructor() {
    super();
  }

  toJoi(): Object {
    const joi = super.toJoi().integer();
    return joi;
  }

  toJSON(): Object {
    const json = super.toJSON();

    json.type = 'integer';

    return json;
  }

}

export default IntegerType;
