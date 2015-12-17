import CustomError from 'customerror';
import QueryParser from '../QueryParser';

export default function(v: Array): Array {
  if (v.length === 0) {
    throw new CustomError(`Invalid $and expression; array cannot be empty`, 'QueryParseError');
  }

  return ['AND'].concat(v.map((e) => QueryParser.parse(e)));
}
