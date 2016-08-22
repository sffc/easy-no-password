"use strict";

const PassportStrategy = require("passport-strategy");
const EasyNoPassword = require("./token_handler");

class EasyStrategy extends PassportStrategy {
	constructor(options, verify) {
		if (!options.secret) throw new Error("Easy No Password authentication strategy requires an encryption secret");
		if (!verify) throw new Error("Easy No Password authentication strategy requires a verify function");
		super();

		this.name = "easy";
		this._verify = verify;
		this._passReqToCallback = options.passReqToCallback;

		this.enp = new EasyNoPassword(options.secret, options.maxTokenAge);
	}

	authenticate(req, options) {
		var self = this;
		if (req.query && req.query.u && req.query.t) {
			var username = req.query.u;
			var token = req.query.t;

			self.enp.isValid(token, username, (err, isValid) => {
				if (isValid) {
					function verified(err, user, info) {
						if (err) return self.error(err);
						if (!user) return self.fail(info);
						self.success(user, info);
					}

					if (self._passReqToCallback) {
						self._verify(req, username, verified);
					} else {
						self._verify(username, verified);
					}
				} else {
					self.fail({ "message": "invalid token" });
				}
			});
		} else {
			self.pass();
		}
	}
}

module.exports = EasyStrategy;
