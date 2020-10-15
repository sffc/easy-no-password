const assert = require('assert')
const enp = require('../lib/handler.js')

const CURRENT_TIMESTAMP = new Date().getTime()

const TOKEN_CREATION_TEST_CASES = [
  {
    secret: 'Gf6y0SWRiiiTj5x2',
    cases: [
      { username: 'bob', token: '46GmWoaOb7J' },
      { username: 'bob', token: 'dUcEZowiWM3' },
      { username: 'bob', token: 'j0VGVYxQY6D' },
      { username: 'alice', token: '7y9YoDy1uvF' },
      { username: 'alice', token: 'czbPzOQ9OJF' },
      { username: '日本', token: 'lNvpdDMaoRM' },
      { username: '中国', token: '2owiBw1Rira' },
    ],
  },
  {
    secret: '3cCVBl232kQ3xtw5',
    cases: [
      { username: 'bob', token: '46GmWoaOb7J' },
      { username: 'bob', token: 'dUcEZowiWM3' },
      { username: 'bob', token: 'j0VGVYxQY6D' },
      { username: 'alice', token: '7y9YoDy1uvF' },
      { username: 'alice', token: 'czbPzOQ9OJF' },
      { username: '日本', token: 'lNvpdDMaoRM' },
      { username: '中国', token: '2owiBw1Rira' },
    ],
  },
]

const IS_VALID_TEST_CASES = [
  // timestamp offset, isValid
  // All test cases are at least 10 seconds (allows for execution time)
  [-1e8, false],
  [-1e6, false],
  [-1e5, true],
  [-1e4, true],
  [1e4, false],
  [1e8, false],
]

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomString(length) {
  var str = ''
  for (let i = 0; i < length; i++) {
    str += CHARS[Math.trunc(Math.random() * CHARS.length)]
  }
  return str
}

describe('enp.create()', () => {
  for (let testCases of TOKEN_CREATION_TEST_CASES) {
    for (let testCase of testCases.cases) {
      let { secret } = testCases
      let { username, token } = testCase

      it(`should not be the same token created and token: '${token}' `, async () => {
        let tokenCreated = await enp.create(username, secret)
        return assert.notStrictEqual(tokenCreated, token)
      })
    }
  }
})

describe('enp.validate()', async () => {
  for (let testCases of TOKEN_CREATION_TEST_CASES) {
    for (let testCase of testCases.cases) {
      let { secret } = testCases
      let { username } = testCase

      it(`should return secret '${secret}', username '${username}' created a valid token `, async () => {
        let tokenCreated = await enp.create(username, secret)
        let validated = await enp.validate(tokenCreated, username, secret)
        return assert.strictEqual(true, validated)
      })
    }
  }
})
