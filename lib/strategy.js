"use strict";

const PassportStrategy = require("passport-strategy");
const EasyNoPassword = require("./token_handler");

class EasyStrategy extends PassportStrategy {
	constructor(options, sendToken, verify) {
		if (!options.secret) throw new Error("Easy No Password authentication strategy requires an encryption secret");
		if (!sendToken) throw new Error("Easy No Password authentication strategy requires a sendToken function");
		if (!verify) throw new Error("Easy No Password authentication strategy requires a verify function");
		super();

		this.name = "easy";
		this._sendToken = sendToken;
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
		} else if (req.query && req.query.s) {
			var username = req.query.s;

			self.enp.createToken(username, (err, token) => {
				if (err) return self.error(err);
				console.log("token:", token);
				self._sendToken(username, token, (err) => {
					if (err) return self.error(err);
					self.pass();
				});
			});

		} else {
			self.pass();
		}
	}
}

module.exports = EasyStrategy;
