'use strict'

const UInt64 = require('cuint').UINT64

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const ZERO = new UInt64(0)
const SIXTY_TWO = new UInt64(62)
const UINT32_CAPACITY = new UInt64(0, 1)

/**
 * Encodes an 8-byte buffer as base 62.
 * @param {Buffer} buffer - buffer must be length 8
 */
const encode = (buffer) => {
  if (buffer.length != 8) {
    throw new TypeError('buffer must be length 8')
  }

  let number = new UInt64(buffer.readUInt32BE(4), buffer.readUInt32BE(0))

  let encoded = ''
  do {
    number.div(SIXTY_TWO)
    encoded = CHARS[number.remainder] + encoded
  } while (number.greaterThan(ZERO))

  return encoded
}

/**
 * Decodes a base 62 string into an 8-byte buffer.
 * @param {String} string - Number encoded must be length 12 digits al least
 */
const decode = (string) => {
  // FIXME: Check for multiplication overflow
  if (string.length > 12) {
    throw new TypeError('Number encoded is too large')
  }

  let numbers = new UInt64()
  for (let i = 0; i < string.length; i++) {
    let n = CHARS.indexOf(string[i])
    if (n === -1) {
      throw new TypeError('Unknown character in string')
    }
    numbers.multiply(SIXTY_TWO)
    numbers.add(new UInt64(n))
  }

  let buffer = new Buffer.alloc(8)
  numbers.div(UINT32_CAPACITY)
  buffer.writeUInt32BE(parseInt(numbers.toString()), 0)
  buffer.writeUInt32BE(numbers.remainder, 4)
  return buffer
}

module.exports = {
  encode,
  decode,
}
