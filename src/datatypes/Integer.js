import NumberType from './Number';

class IntegerType extends NumberType {

  constructor() {
    super();
  }

  set precision(v: number): void {
    this.props.precision = v;
  }

  get precision(): number {
    return this.props.precision;
  }

  toJoi(): Joi {
    const joi = super.toJoi();

    if (this.props.precision) joi.precision(this.props.precision);

    return joi;
  }

  toJSON(): Object {
    const json = super.toJSON();

    json.type = 'float';

    return json;
  }

}

export default IntegerType;
