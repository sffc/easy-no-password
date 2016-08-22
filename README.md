Easy No Password (and Two-Factor Authentication)
================================================

The increasing scrutiny over weak passwords has been leading more and more developers to opt for passwordless login flows and two-factor authentication.

Passwordless login and two-factor authentication usually involve emailing or texting a unique token to a user, and giving them a certain amount of time to enter that token into the login screen.

This library is unique because it uses cryptography techniques to generate timestamped tokens, eliminating the need for a database to store tokens.  The tokens themselves contain all the information needed to check for their validity.

## Installation

    $ npm install --save easy-no-password

## Quick Start

```javascript
"use strict";

const enp = require("easy-no-password")("YOUR_LONG_SECURE_ENCRYPTION_SECRET");

// Generating a token
var userId = // ...
enp.createToken(userId, (err, token) => {
	if (err) return console.error(err);
	// Send token to the user, using email, SMS, etc.
});

// Checking a token
var token = // ...
var userId = // ...
enp.isValid(token, userId, (err, isValid) => {
	if (isValid) {
		console.log("User is real!", userId);
	} else {
		console.log("Someone is trying to hack into user's account!", userId);
	}
});
```

## More Details

The tokens are 64-bit values encoded into 10-11 ASCII characters.  Tokens are generated with a millisecond timestamp resolution.  This means that with the default window of 15 minutes, at any point in time, 9e5 tokens are valid out of a total space of 2^64 (0.000000000005%).

To customize the size of the token validity window, set a custom number of millisconds in the constructor:

```javascript
// Set tokens to be valid for 24 hours
const enp = require("easy-no-password")("secret", 24*3600*1000);
```

To directly extract the timestamp out of a token or generate a token from a custom timestamp, use the following methods.  Note that these methods are internal and may be changed in a future update.

```javascript
// Generate a token with custom timestamp:
enp._encrypt(timestamp, userId, (err, token) => {
	// do stuff with token
});

// Get the timestamp from a token:
enp._decrypt(token, userId, (err, timestamp) => {
	// do stuff with timestamp
});
```

## Contributing

Contributions are welcome.  Before submitting a pull request, please check for errors by running the tests and the JavaScript linter.

    $ cd /path/to/easy-no-password
    $ ./node_modules/.bin/mocha
    $ ./node_modules/.bin/eslint .

## MIT License

Copyright (c) 2016 Shane Carr and others.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
