"use strict";

const CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Encodes an 8-byte Uint8Array as base 62.
 */
function encode(uint8array) {
	if (uint8array.length != 8) {
		throw new TypeError("Buffer must be length 8");
	}

	var num = 0n;
	for (let i=0; i<8; i++) {
		num <<= 8n;
		num += BigInt(uint8array[i]);
	}

	var str = "";
	do {
		let remainder = num % 62n;
		num /= 62n;
		str = CHARS[remainder] + str;
	} while (num > 0n);

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

	var num = 0n;
	for (let i=0; i<str.length; i++) {
		let n = CHARS.indexOf(str[i]);
		if (n === -1) {
			throw new TypeError("Unknown character in string");
		}
		num *= 62n;
		num += BigInt(n);
	}

	var buf = new Buffer(8);
	for (let i=7; i>=0; i--) {
		let remainder = num % 256n;
		num /= 256n;
		buf[i] = Number(remainder);
	}
	return new Uint8Array(buf);
}

module.exports = { encode, decode };
