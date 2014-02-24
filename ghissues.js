const jsonist = require('jsonist')
    , qs      = require('querystring')
    , xtend   = require('xtend')


function makeOptions (auth, options) {
  return xtend({
      headers : { 'User-Agent' : 'Magic Node.js application that does magic things' }
    , auth    : auth.user + ':' + auth.token
  }, options)
}


function handler (callback) {
  return function responseHandler (err, data) {
    if (err)
      return callback(err)

    if (data.error || data.message)
      return callback(new Error('Error from GitHub: ' + (data.error || data.message)))

    callback(null, data)
  }
}


function ghget (auth, url, options, callback) {
  options = makeOptions(auth, options)

  jsonist.get(url, options, handler(callback))
}


function ghpost (auth, url, data, options, callback) {
  options = makeOptions(auth, options)

  jsonist.post(url, data, options, handler(callback))
}


module.exports.list = function list (auth, org, repo, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var issues = []
    , optqs  = qs.stringify(options)

  if (optqs)
    optqs = '&' + optqs

  //TODO: use 'Link' headers to improve the guesswork here
  ;(function next (page) {
    var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues?page=' + page + optqs

    ghget(auth, url, options, function (err, data) {
      if (err)
        return callback(err)

      if (!data.length)
        return callback(null, issues)

      issues.push.apply(issues, data)

      next(page + 1)
    })
  }(0))
}


module.exports.get = function get (auth, org, repo, num, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num

  ghget(auth, url, options, callback)
}


module.exports.create = function create (auth, org, repo, data, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues'

  ghpost(auth, url, data, options, callback)
}


module.exports.listComments = function listComments (auth, org, repo, num, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var comments = []

  //TODO: use 'Link' headers to improve the guesswork here
  ;(function next (page) {
    var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num + '/comments?page=' + page

    ghget(auth, url, options, function (err, data) {
      if (err)
        return callback(err)

      if (!data.length)
        return callback(null, comments)

      comments.push.apply(comments, data)

      next(page + 1)
    })
  }(0))
}


module.exports.createComment = function createComment (auth, org, repo, num, body, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num + '/comments'

  ghpost(auth, url, { body: body }, options, callback)
}

