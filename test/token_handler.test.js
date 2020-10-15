"use strict";

/* eslint-env mocha */

const assert = require("assert");
const async = require("async");
const crypto = require("crypto");
const EasyNoPassword = require("../lib/token_handler");

const CURRENT_TIMESTAMP = new Date().getTime();

const TOKEN_CREATION_TEST_CASES = [
	// secret, [ username, timestamp, token ]
	[ "Gf6y0SWRiiiTj5x2", [
		[ "bob", new Date(Date.UTC(2016, 8, 21, 0, 0, 0, 0)).getTime(), "46GmWoaOb7J" ],
		[ "bob", new Date(Date.UTC(2016, 8, 21, 0, 0, 0, 1)).getTime(), "dUcEZowiWM3" ],
		[ "bob", new Date(Date.UTC(2050, 1, 2, 3, 4, 5, 0)).getTime(), "j0VGVYxQY6D" ],
		[ "alice", new Date(Date.UTC(2016, 8, 21, 0, 0, 0, 0)).getTime(), "7y9YoDy1uvF" ],
		[ "alice", new Date(Date.UTC(2050, 1, 2, 3, 4, 5, 0)).getTime(), "czbPzOQ9OJF" ],
		[ "日本", new Date(Date.UTC(2017, 0, 1, 0, 0, 0, 0)).getTime(), "lNvpdDMaoRM" ],
		[ "中国", new Date(Date.UTC(2017, 0, 1, 0, 0, 0, 0)).getTime(), "2owiBw1Rira" ],
	]],
	[ "3cCVBl232kQ3xtw5", [
		[ "bob", new Date(Date.UTC(2016, 8, 21, 0, 0, 0, 0)).getTime(), "lGXE4jFLwtP" ],
		[ "bob", new Date(Date.UTC(2016, 8, 21, 0, 0, 0, 1)).getTime(), "9fRORLwpEw5" ],
		[ "bob", new Date(Date.UTC(2050, 1, 2, 3, 4, 5, 0)).getTime(), "gTR7AbSJFu6" ],
		[ "alice", new Date(Date.UTC(2016, 8, 21, 0, 0, 0, 0)).getTime(), "60in3qeoSrx" ],
		[ "alice", new Date(Date.UTC(2050, 1, 2, 3, 4, 5, 0)).getTime(), "4HxIgyibsDA" ],
		[ "日本", new Date(Date.UTC(2017, 0, 1, 0, 0, 0, 0)).getTime(), "kVO0qRiRLxw" ],
		[ "中国", new Date(Date.UTC(2017, 0, 1, 0, 0, 0, 0)).getTime(), "48vxT2SDEuD" ],
	]],
];

const IS_VALID_TEST_CASES = [
	// timestamp offset, isValid
	// All test cases are at least 10 seconds (allows for execution time)
	[ -1e8, false ],
	[ -1e6, false ],
	[ -1e5, true ],
	[ -1e4, true ],
	[ 1e4, false ],
	[ 1e8, false ],
];

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randomString(length) {
	var str = "";
	for (let i=0; i<length; i++) {
		str += CHARS[Math.trunc(Math.random()*CHARS.length)];
	}
	return str;
}

describe("token_handler.js", () => {
	describe("enp#_encrypt()", () => {
		for (let test of TOKEN_CREATION_TEST_CASES) {
			let secret = test[0];
			let enp = new EasyNoPassword(secret);
			for (let line of test[1]) {
				let username = line[0];
				let timestamp = line[1];
				let token = line[2];

				it(`should return '${token}' with secret '${secret}', username '${username}', and timestamp '${timestamp}'`, (done) => {
					async.waterfall([
						(_next) => {
							enp._encrypt(timestamp, username, _next);
						},
						(_token, _next) => {
							assert.equal(token, _token);
							_next(null);
						}
					], done);
				});
			}
		}
	});

	describe("enp#_decrypt()", () => {
		for (let test of TOKEN_CREATION_TEST_CASES) {
			let secret = test[0];
			let enp = new EasyNoPassword(secret);
			for (let line of test[1]) {
				let username = line[0];
				let timestamp = line[1];
				let token = line[2];

				it(`should return '${timestamp}' with secret '${secret}', username '${username}', and token '${token}'`, (done) => {
					async.waterfall([
						(_next) => {
							enp._decrypt(token, username, _next);
						},
						(_timestamp, _next) => {
							assert.equal(timestamp, _timestamp);
							_next(null);
						}
					], done);
				});
			}
		}
	});

	describe("enp#isValid", () => {
		for (let test of IS_VALID_TEST_CASES) {
			let offset = test[0];
			let isValid = test[1];
			it(`should return '${isValid}' 100 times in a row for offset ${offset} with random usernames and secrets`, (done) => {
				async.each(
					new Array(100),
					(_, _next) => {
						let secret = crypto.randomBytes(8);
						let username = randomString(10);
						let timestamp = CURRENT_TIMESTAMP + offset;
						let enp = new EasyNoPassword(secret);
						async.auto({
							"token": (__next) => {
								enp._encrypt(timestamp, username, __next);
							},
							"decrypt": ["token", (results, __next) => {
								enp._decrypt(results.token, username, __next);
							}],
							"isValid": ["token", (results, __next) => {
								enp.isValid(results.token, username, __next);
							}],
							"check": ["decrypt", "isValid", (results, __next) => {
								assert.equal(results.decrypt, timestamp);
								assert.equal(results.isValid, isValid);
								__next(null);
							}]
						}, _next);
					},
					done
				);
			});
		}

		it("should return 'false' 99% of the time for random keys", (done) => {
			async.reduce(
				new Array(500),
				0,
				(memo, _, _next) => {
					let secret = crypto.randomBytes(8);
					let username = randomString(10);
					let token = randomString(Math.trunc(8 + Math.random() * 6));
					let enp = new EasyNoPassword(secret);
					enp.isValid(token, username, (_, isValid) => {
						if (isValid) {
							// Very rare occurence
							console.error("Random token passed as valid:", secret, username, token);  // eslint-disable-line no-console
						}
						_next(null, isValid ? memo + 1 : memo);
					});
				},
				(err, successes) => {
					if (err) return done(err);
					assert(successes <= 1, successes + " successes out of 500 trials");
					done();
				}
			);
		});
	});
});

