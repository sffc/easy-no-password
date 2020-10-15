let EasyNoPassword = require('./lib/token_handler')
let enp = require('./lib/handler')
let EasyStrategy = require('./lib/strategy')

function construct(secret, maxTokenAge) {
  return new EasyNoPassword(secret, maxTokenAge)
}
construct.Strategy = EasyStrategy
construct.AsyncAwait = enp

module.exports = construct
