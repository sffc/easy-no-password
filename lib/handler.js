const assert = require('assert')
const base62 = require('./base62')
const crypto = require('crypto')

const UINT32_CAPACITY = 0xffffffff + 1

/**
 * Create a no-password auth token.  Can be emailed or texted to the user.
 *
 * @param {string} username  An identifier for this user, which could be their username, user ID, email address, and so forth.  This is required to ensure that tokens are unique to a particular user.
 * @param {string} secret   A secret string to encrypt then decrypt no-password auth token
 */
const create = async (username, secret) => {
  if (!username) throw new Error('An identifier for the user is required.')
  if (typeof username !== 'string')
    throw new Error('The first argument must be a username string.')

  let encrypted = await encrypt(username, secret)
  return encrypted
}

/**
 * Parse a no-password auth token and check if is expiry
 *
 * @param {string} token    A token created by {@link #create}.
 * @param {string} username The identifier used when creating the token
 * @param {string} secret   A secret string to encrypt then decrypt no-password auth token
 * @return `boolean`    which is true if the token is valid, or false if the token is invalid.
 */
const validate = async (token, username, secret, expiry = 900000) => {
  if (!username) throw new Error('username is required.')
  if (typeof username !== 'string')
    throw new Error('username must be a string.')
  if (!token) throw new Error('token required.')
  if (typeof token !== 'string') throw new Error('token must be a string.')

  let timestamp = await decrypt(token, username, secret)

  let currentTimestamp = new Date().getTime()

  if (currentTimestamp - timestamp < expiry && currentTimestamp - timestamp > 0)
    return true
  else return false
}

/**
 * Create Key to use with cipher and decipher
 * @param {string} username An identifier for this user, which could be their username, user ID, email address, and so forth.  This is required to ensure that tokens are unique to a particular user.
 * @param {string} secret   A secret string to encrypt then decrypt no-password auth token
 * @param {number} iterations
 */
const createKey = (username, secret, iterations = 1000) => {
  let usernameBuffer = new Buffer.from(username, 'utf-8')
  let key = crypto.pbkdf2Sync(usernameBuffer, secret, iterations, 16, 'sha512')
  return key
}

/**
 * Encrypt username with secret
 *
 * @param {string} username An identifier for this user, which could be their username, user ID, email address, and so forth.  This is required to ensure that tokens are unique to a particular user.
 * @param {secret} secret   A secret string to encrypt then decrypt no-password auth token
 * @returns {string} alphanumeric no-password auth token
 */
const encrypt = async (username, secret) => {
  let key = createKey(username, secret)

  // timestamp -> buf
  let timestamp = new Date().getTime()
  let buffer = new Buffer.alloc(8)
  buffer.writeUInt32BE(timestamp / UINT32_CAPACITY, 0, true)
  buffer.writeUInt32BE(timestamp % UINT32_CAPACITY, 4, true)

  let cipher = createCipher(key)
  let encrypted = cipher.update(buffer)
  assert.strictEqual(0, cipher.final().length)

  // encrypted -> token
  let token = base62.encode(encrypted)
  return token
}

/**
 * Decrypt username with secret
 *
 * @param {string} token    The no-password auth token to decrypt
 * @param {string} username An identifier for this user, which could be their username, user ID, email address, and so forth.  This is required to ensure that tokens are unique to a particular user.
 * @param {secret} secret   A secret used to encrypt the no-password auth token
 * @returns {string} alphanumeric no-password auth token
 */
const decrypt = (token, username, secret) => {
  let key = createKey(username, secret)
  // token -> encrypted
  // This can fail if an invalid token is passed.  Fail silently and return timestamp zero.
  let encrypted
  try {
    encrypted = base62.decode(token)
  } catch (error) {
    throw error
  }

  let decipher = createDecipher(key)
  let buffer = decipher.update(encrypted)
  assert.strictEqual(0, decipher.final().length)

  // buf -> timestamp
  let timestamp = 0
  timestamp += buffer.readUInt32BE(0) * UINT32_CAPACITY // note: timestamps are small enough that there is no floating-point overflow happening here
  timestamp += buffer.readUInt32BE(4)

  return timestamp
}

/**
 *
 * Cipher and Decipher
 *
 */

const createCipher = (key) => {
  // Use a zero vector as the default IV.  It isn't necessary to enforce distinct ciphertexts.
  let iv = new Buffer.alloc(8)
  iv.fill(0)
  // buf -> encrypted
  let cipher = crypto.createCipheriv('bf', key, iv)
  cipher.setAutoPadding(false)
  return cipher
}

const createDecipher = (key) => {
  // Use a zero vector as the default IV.  It isn't necessary to enforce distinct ciphertexts.
  let iv = new Buffer.alloc(8)
  iv.fill(0)
  // encrypted -> buf
  let decipher = crypto.createDecipheriv('bf', key, iv)
  decipher.setAutoPadding(false)
  return decipher
}

module.exports = {
  create,
  validate,
}
