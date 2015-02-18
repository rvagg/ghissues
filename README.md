# ghissues

[![Build Status](https://secure.travis-ci.org/rvagg/ghissues.png)](http://travis-ci.org/rvagg/ghissues)

**A node library to interact with the GitHub issues API**

[![NPM](https://nodei.co/npm/ghissues.png?mini=true)](https://nodei.co/npm/ghissues/)

## Example usage

```js
const ghissues     = require('ghissues')
    , authOptions = { user: 'rvagg', token: '24d5dee258c64aef38a66c0c5eca459c379901c2' }

// list all issues in a repo
ghissues.list(authOptions, 'rvagg', 'jsonist', function (err, issuelist) {
  // Array of issues data for 'rvagg/jsonist'
  console.log(issuelist)
})

// get issue data by number (not internal GitHub id)
ghissues.get(authOptions, 'rvagg', 'nan', 123, function (err, issue) {
  // object containing full issue #123
  console.log(issue)
})

// create an issue
var data = {
    title : 'New issue bro'
  , body  : 'Pretty **slick** `markdown`'
}
ghissues.create(authOptions, 'rvagg', 'jsonist', data, function (err, issue) {
  // data for new issue
  console.log(issue)
})

// list all comments in an issue
ghissues.listComments(authOptions, 'rvagg', 'jsonist', 47, function (err, commentlist) {
  // Array of comment data for 'rvagg/jsonist#47'
  console.log(commentlist)
})

// create a comment
var body = 'Whoa dude, this is awesomesauce!! :+1:'
ghissues.createComment(authOptions, 'rvagg', 'jsonist', 101, body, function (err, issue) {
  // data for new comment in 'rvagg/jsonist#101'
  console.log(issue)
})
```


The auth data is compatible with [ghauth](https://github.com/rvagg/ghauth) so you can just connect them together to make a simple command-line application:

```js
const ghauth      = require('ghauth')
    , ghissues    = require('ghissues')
    , authOptions = {
          configName : 'issue-lister'
        , scopes     : [ 'user' ]
      }

ghauth(authOptions, function (err, authData) {
  ghissues.list(authData, 'rvagg', 'node-levelup', function (err, list) {
    console.log('Issues in rvagg/node-levelup:')
    list.forEach(function (i) {
      console.log('#%s: %s', i.number, i.title) 
    })
  })
})
```


## License

**ghissues** is Copyright (c) 2014 Rod Vagg [@rvagg](https://github.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
