import NumberType from './Number';

class FloatType extends NumberType {

  constructor() {
    super();
  }

  precision(v: number): FloatType {
    this.props.precision = v;
    return this;
  }

  toJoi(): Object {
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

export default FloatType;
