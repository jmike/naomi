require('dotenv').load({ silent: true });
require('babel-core/register');

// load the test files
require('./schema');
require('./naomi');
require('./database');
require('./collection');
require('./queryparsers/selection');
require('./queryparsers/projection');
require('./queryparsers/orderby');
require('./queryparsers/limit');
require('./queryparsers/offset');
require('./datatypes/integer');
require('./datatypes/float');
require('./datatypes/number');
require('./datatypes/string');
require('./datatypes/uuid');
require('./datatypes/enum');
require('./datatypes/date');
require('./datatypes/boolean');
require('./datatypes/binary');
require('./datatypes/email');
