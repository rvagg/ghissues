const ghutil = require('ghutils')


const ghget  = ghutil.ghget
    , ghpost = ghutil.ghpost
    , ghlist = ghutil.issuesList


module.exports.list = ghlist('issues')


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
  }(1))
}


module.exports.createComment = function createComment (auth, org, repo, num, body, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num + '/comments'

  ghpost(auth, url, { body: body }, options, callback)
}
