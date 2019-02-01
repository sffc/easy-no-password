var EasyNoPassword = require("./build/token_handler");
var EasyStrategy = require("./build/strategy");

function construct(secret, maxTokenAge) {
	return new EasyNoPassword(secret, maxTokenAge);
}
construct.Strategy = EasyStrategy;

module.exports = construct;
