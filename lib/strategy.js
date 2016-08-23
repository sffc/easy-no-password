"use strict";

const PassportStrategy = require("passport-strategy");
const EasyNoPassword = require("./token_handler");

class EasyStrategy extends PassportStrategy {
	constructor(options, parseRequest, sendToken, verify) {
		if (!options.secret) throw new Error("Easy No Password authentication strategy requires an encryption secret");
		if (!parseRequest) throw new Error("Easy No Password authentication strategy requires a parseRequest function");
		if (!sendToken) throw new Error("Easy No Password authentication strategy requires a sendToken function");
		if (!verify) throw new Error("Easy No Password authentication strategy requires a verify function");
		super();

		this.name = "easy";
		this._parseRequest = parseRequest;
		this._sendToken = sendToken;
		this._verify = verify;
		this._passReqToCallback = options.passReqToCallback;

		this.enp = new EasyNoPassword(options.secret, options.maxTokenAge);
	}

	authenticate(req /*, options */) {
		var self = this;
		var data = self._parseRequest(req);
		if (data === null) return self.pass();

		if (data.stage === 2) {
			let username = data.username;
			let token = data.token;

			self.enp.isValid(token, username, (err, isValid) => {
				if (isValid) {
					let verified = function(err, user, info) {
						if (err) return self.error(err);
						if (!user) return self.fail(info);
						self.success(user, info);
					};

					if (self._passReqToCallback) {
						self._verify(req, username, verified);
					} else {
						self._verify(username, verified);
					}
				} else {
					self.fail({ "message": "invalid token" });
				}
			});
		} else if (data.stage === 1) {
			let username = data.username;

			self.enp.createToken(username, (err, token) => {
				if (err) return self.error(err);
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
