import NumberType from './Number';

class IntegerType extends NumberType {

  constructor() {
    super();
  }

  toJoi(): Joi {
    const joi = super.toJoi();

    joi.integer();

    return joi;
  }

  toJSON(): Object {
    const json = super.toJSON();

    json.type = 'integer';

    return json;
  }

}

export default IntegerType;
