"use strict";

/* eslint-env mocha */

const assert = require("assert");
const base62 = require("../lib/base62");
const crypto = require("crypto");

const TEST_CASES = [
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), "0"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x05]), "5"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0d]), "d"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10]), "g"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x20]), "w"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24]), "A"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3d]), "Z"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3e]), "10"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3f]), "11"],
	[new Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]), "4GFfc4"],
	[
		new Buffer.from([0x00, 0x00, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd]),
		"17gMRISDz",
	],
	[
		new Buffer.from([0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd, 0xdd]),
		"j2ZrDtSWvKd",
	],
	[
		new Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
		"lYGhA16ahyf",
	],
];

describe("base62.js", () => {
	describe("#base62.encode()", () => {
		for (let test of TEST_CASES) {
			let buf = test[0];
			let str = test[1];
			it(`should return '${str}' upon evaluating buffer '${buf.toString(
				"hex"
			)}'`, () => {
				assert.equal(str, base62.encode(buf));
			});
		}
	});

	describe("#base62.decode()", () => {
		for (let test of TEST_CASES) {
			let buf = test[0];
			let str = test[1];
			it(`should return '${buf.toString(
				"hex"
			)}' upon evaluating string '${str}'`, () => {
				assert.equal(buf.toString("hex"), base62.decode(str).toString("hex"));
			});
		}
		it("should throw an exception for invalid entries", () => {
			assert.throws(() => {
				base62.decode("QWE!@#éåñ");
			}, TypeError);
			assert.throws(() => {
				base62.decode("veryveryveryverylong");
			}, TypeError);
		});
	});

	describe("round-trip", () => {
		it("should produce correct round-trip results 1000 times in a row", () => {
			for (let i = 0; i < 1000; i++) {
				let buf = crypto.randomBytes(8);
				let str = base62.encode(buf);
				let decoded = base62.decode(str);
				assert.equal(
					buf.toString("hex"),
					decoded.toString("hex"),
					`iteration ${i + 1}: '${buf.toString("hex")}' != '${decoded.toString(
						"hex"
					)}' (intermediate: '${str}')`
				);
			}
		});
	});
});
