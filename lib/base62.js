"use strict";

const UInt64 = require("cuint").UINT64;

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ZERO = new UInt64(0);
const SIXTY_TWO = new UInt64(62);
const UINT32_CAPACITY = new UInt64(0, 1);

/**
 * Encodes an 8-byte buffer as base 62.
 */
function encode(buf) {
	if (buf.length != 8) {
		throw new TypeError("Buffer must be length 8");
	}

	var num = new UInt64(buf.readUInt32BE(4), buf.readUInt32BE(0));
	var str = "";
	do {
		num.div(SIXTY_TWO);
		str = CHARS[num.remainder] + str;
	} while (num.greaterThan(ZERO));

	return str;
}

/*
 * Decodes a base 62 string into an 8-byte buffer.
 */
function decode(str) {
	// FIXME: Check for multiplication overflow
	if (str.length > 12) {
		throw new TypeError("Number encoded is too large");
	}

	var num = new UInt64();
	for (let i=0; i<str.length; i++) {
		let n = CHARS.indexOf(str[i]);
		if (n === -1) {
			throw new TypeError("Unknown character in string");
		}
		num.multiply(SIXTY_TWO);
		num.add(new UInt64(n));
	}

	var buf = new Buffer(8);
	num.div(UINT32_CAPACITY);
	buf.writeUInt32BE(parseInt(num.toString()), 0);
	buf.writeUInt32BE(num.remainder, 4);
	return buf;
}

module.exports = { encode, decode };
