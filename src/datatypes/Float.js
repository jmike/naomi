import NumberType from './Number';

class FloatType extends NumberType {

  constructor() {
    super();
  }

  set precision(v: number): void {
    this.props.precision = v;
  }

  toJoi(): Object {
    let joi = super.toJoi();

    if (this.props.precision) joi = joi.precision(this.props.precision);

    return joi;
  }

  toJSON(): Object {
    const json = super.toJSON();

    json.type = 'float';

    return json;
  }

}

export default FloatType;
