# ghissues

**A Node.js library to interact with the GitHub issues API**

[![NPM](https://nodei.co/npm/ghissues.svg?style=flat&data=n,v&color=blue)](https://nodei.co/npm/ghissues/)

## Requirements

- Node.js >= 20

## Example usage

```js
import * as ghissues from 'ghissues'

const auth = { token: 'your-github-token' }

// list all issues in a repo
const issues = await ghissues.list(auth, 'rvagg', 'jsonist')
console.log(issues)

// get issue data by number (not internal GitHub id)
const issue = await ghissues.get(auth, 'rvagg', 'nan', 123)
console.log(issue)

// create an issue
const newIssue = await ghissues.create(auth, 'rvagg', 'jsonist', {
  title: 'New issue',
  body: 'Pretty **slick** `markdown`'
})
console.log(newIssue)

// list all comments in an issue
const comments = await ghissues.listComments(auth, 'rvagg', 'jsonist', 47)
console.log(comments)

// create a comment
const comment = await ghissues.createComment(auth, 'rvagg', 'jsonist', 101, 'Whoa dude!')
console.log(comment)
```

The auth data is compatible with [ghauth](https://github.com/rvagg/ghauth) so you can connect them together:

```js
import ghauth from 'ghauth'
import * as ghissues from 'ghissues'

const auth = await ghauth({
  configName: 'issue-lister',
  scopes: ['user']
})

const issues = await ghissues.list(auth, 'rvagg', 'node-levelup')
console.log('Issues in rvagg/node-levelup:')
issues.forEach((i) => {
  console.log('#%s: %s', i.number, i.title)
})
```

## API

All methods return Promises.

### ghissues.list(auth, org, repo, options)

List all issues in a repository. Returns an array of issue objects.

### ghissues.get(auth, org, repo, num, options)

Get a single issue by number. Returns the issue object.

### ghissues.create(auth, org, repo, data, options)

Create a new issue. `data` should contain `title` and optionally `body`. Returns the created issue.

### ghissues.listComments(auth, org, repo, num, options)

List all comments on an issue. Returns an array of comment objects.

### ghissues.createComment(auth, org, repo, num, body, options)

Create a comment on an issue. Returns the created comment.

## License

**ghissues** is Copyright (c) 2014-2025 Rod Vagg [@rvagg](https://github.com/rvagg) and licensed under the MIT licence. All rights not explicitly granted in the MIT license are reserved. See the included LICENSE file for more details.
