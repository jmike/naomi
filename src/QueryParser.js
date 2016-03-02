import Selection from './parsers/Selection';
import Projection from './parsers/Projection';
import OrderBy from './parsers/OrderBy';
import Limit from './parsers/Limit';
import Offset from './parsers/Offset';

/**
 * @constructor
 */
function QueryParser() {
  // do nothing for now
}

QueryParser.prototype.parseSelection = Selection.parse.bind(Selection);
QueryParser.prototype.parseProjection = Projection.parse.bind(Projection);
QueryParser.prototype.parseOrderBy = OrderBy.parse.bind(OrderBy);
QueryParser.prototype.parseLimit = Limit.parse.bind(Limit);
QueryParser.prototype.parseOffset = Offset.parse.bind(Offset);

export default QueryParser;
