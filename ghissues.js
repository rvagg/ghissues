const ghutils = require('ghutils')


module.exports.list = function list (auth, org, repo, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues?page=1'
  ghutils.lister(auth, url, options, callback)
}

module.exports.get = function get (auth, org, repo, num, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num

  ghutils.ghget(auth, url, options, callback)
}


module.exports.create = function create (auth, org, repo, data, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues'

  ghutils.ghpost(auth, url, data, options, callback)
}


module.exports.listComments = function listComments (auth, org, repo, num, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num + '/comments?page=1'
  ghutils.lister(auth, url, options, callback)
}


module.exports.createComment = function createComment (auth, org, repo, num, body, options, callback) {
  if (typeof options == 'function') {
    callback = options
    options  = {}
  }

  var url = 'https://api.github.com/repos/' + org + '/' + repo + '/issues/' + num + '/comments'

  ghutils.ghpost(auth, url, { body: body }, options, callback)
}
