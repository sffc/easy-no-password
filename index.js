var EasyNoPassword = require("./lib/token_handler");
var EasyStrategy = require("./lib/strategy");

function construct(secret, maxTokenAge) {
	return new EasyNoPassword(secret, maxTokenAge);
}
construct.Strategy = EasyStrategy;

module.exports = construct;
