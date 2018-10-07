Easy No Password (and Two-Factor Authentication)
================================================

The increasing scrutiny over weak passwords has been leading more and more developers to opt for passwordless login flows and two-factor authentication.

Passwordless login and two-factor authentication usually involve emailing or texting a unique token to a user, and giving them a certain amount of time to enter that token into the login screen.

This library is unique because it uses cryptography techniques to generate timestamped tokens, eliminating the need for a database to store tokens.  The tokens themselves contain all the information needed to check for their validity.

In addition to the basic API where you can directly generate and check tokens, there is also a [Passport Strategy](http://passportjs.org) API available for easy integration with other forms of authentication.

[![Build Status](https://travis-ci.org/sffc/easy-no-password.svg?branch=master)](https://travis-ci.org/sffc/easy-no-password)
[![Known Vulnerabilities](https://snyk.io/test/github/sffc/easy-no-password/badge.svg)](https://snyk.io/test/github/sffc/easy-no-password)
[![npm version](http://img.shields.io/npm/v/easy-no-password.svg?style=flat)](https://npmjs.org/package/REPO "View this project on npm")


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

## Using with Passport

The following example uses the route */auth/tok* for handling Easy No Password requests.  To request a token, the user can POST to that URL with their email address.  To verify a token, the user can GET to that URL with their email address and their token.  In between, the user can be sent an email with the appropriate verification link.

```javascript
const EasyNoPassword = require("easy-no-password");

// Example Express configuration:
app
	.use(BodyParser.urlencoded())
	.post("/auth/tok", Passport.authenticate("easy"), function(req, res) {
		// The user has been emailed.
		// Possible flow: redirect the user to a page with a form where they can
		// enter the token if they can't click the link from their email.
	})
	.get("/auth/tok", Passport.authenticate("easy", {
		successRedirect: "/",
		failureRedirect: "/oops.html"
	}));

// Example Passport configuration:
passport.use(new (EasyNoPassword.Strategy)({
		secret: "YOUR_LONG_SECURE_ENCRYPTION_SECRET"
	},
	function (req) {
		// Check if we are in "stage 1" (requesting a token) or "stage 2" (verifying a token)
		if (req.body && req.body.email) {
			return { stage: 1, username: req.body.email };
		} else if (req.query && req.query.email && req.query.token) {
			return { stage: 2, username: req.query.email, token: req.query.token };
		} else {
			return null;
		}
	},
	function (email, token, done) {
		var safeEmail = encodeURIComponent(email);
		var url = "https://my.domain.com/auth/tok?email=" + safeEmail + "&token=" + token;
		// Send the link to user via email.  Call done() when finished.
	},
	function (email, done) {
		// User is authenticated!  Call your findOrCreateUser function here.
	}));
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

You can control the security/performance tradeoff by tweaking the `iterations` property of your EasyNoPassword instance.  The default setting is 1000, which takes 1-2 ms of CPU time.  Increasing the setting will make tokens harder to crack at the expense of costing more CPU cycles.  Note that the most expensive part of the computation is performed in the thread pool and won't block the main event thread (which is why all of the APIs are asynchronous).

```javascript
// Increase the number of iterations to 500000 (~500 ms of CPU time)
enp.iterations = 500000;
```


## Contributing

Contributions are welcome.  Before submitting a pull request, please check for errors by running the tests and the JavaScript linter.

    $ cd /path/to/easy-no-password
    $ ./node_modules/.bin/mocha
    $ ./node_modules/.bin/eslint .

Please also run your changes with an older version of Node.js; this library supports back to Node.js 0.10.  Note that the tests for `enp#_encrypt()` and `enp#_decrypt()` will fail in 0.10, where hashing is performed using sha1; from 0.12 forward, the more secure sha512 hashing function is used instead.  The tests are written for sha512.

## MIT License

Copyright (c) 2016 Shane Carr and others.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
