const http           = require('http')
    , test           = require('tape')
    , requireSubvert = require('require-subvert')(__dirname)
    , _hyperquest    = require('hyperquest')
    , xtend          = require('xtend')
    , EE             = require('events').EventEmitter
    , bl             = require('bl')


requireSubvert.subvert('hyperquest', hyperquest)

var ghissues = require('./')
  , hyperget

function hyperquest () {
  return hyperget.apply(this, arguments)
}


function makeServer (data) {
  var ee     = new EE()
    , i      = 0
    , server = http.createServer(function (req, res) {
        ee.emit('request', req)

        var _data = Array.isArray(data) ? data[i++] : data
        res.end(JSON.stringify(_data))

        if (!Array.isArray(data) || i == data.length)
          server.close()
      })
      .listen(0, function (err) {
        if (err)
          return ee.emit('error', err)

        hyperget = function (url, opts) {
          ee.emit('get', url, opts)
          return _hyperquest('http://localhost:' + server.address().port, opts)
        }

        ee.emit('ready')
      })
      .on('close', ee.emit.bind(ee, 'close'))

  return ee
}


function toAuth (auth) {
  return 'Basic ' + (new Buffer(auth.user + ':' + auth.token).toString('base64'))
}


function verifyRequest (t, auth) {
  return function (req) {
    t.ok(true, 'got request')
    t.equal(req.headers['authorization'], toAuth(auth), 'got auth header')
  }
}


function verifyUrl (t, urls) {
  var i = 0
  return function (_url) {
    if (i == urls.length)
      return t.fail('too many urls/requests')
    t.equal(_url, urls[i++], 'correct url')
  }
}


function verifyClose (t) {
  return function () {
    t.ok(true, 'got close')
  }
}


function verifyData (t, data) {
  return function (err, _data) {
    t.notOk(err, 'no error')
    t.ok((data === '' && _data === '') || _data, 'got data')
    t.deepEqual(_data, data, 'got expected data')
  }
}


test('test list issues', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.list(xtend(auth), org, repo, verifyData(t, testData[0]))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues?page=0'
      , 'https://api.github.com/repos/testorg/testrepo/issues?page=1'
    ]))
    .on('close'  , verifyClose(t))
})


test('test list multi-page issues', function (t) {
  t.plan(13)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [ { test3: 'data3' }, { test4: 'data4' } ], [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.list(xtend(auth), org, repo, verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues?page=0'
      , 'https://api.github.com/repos/testorg/testrepo/issues?page=1'
      , 'https://api.github.com/repos/testorg/testrepo/issues?page=2'
    ]))
    .on('close'  , verifyClose(t))
})


test('test list no issues', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [ [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.list(xtend(auth), org, repo, verifyData(t, []))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues?page=0'
    ]))
    .on('close'  , verifyClose(t))
})


test('test get issue by id', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 101
    , testData = { id: num, issue: 'body' }
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.get(xtend(auth), org, repo, num, verifyData(t, testData))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num
    ]))
    .on('close'  , verifyClose(t))
})


test('test create new issue', function (t) {
  t.plan(8)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = { title: 'issue title', body: 'issue body' }
    , num      = 101
    , resp     = 'derp'
    , server

  server = makeServer(resp)
    .on('ready', function () {
      ghissues.create(xtend(auth), org, repo, testData, verifyData(t, resp))
    })
    .on('request', verifyRequest(t, auth))
    .on('request', function (req) {
      req.pipe(bl(function (err, data) {
        t.notOk(err, 'no error')
        t.deepEqual(JSON.parse(data.toString()), testData, 'got expected post data')
      }))
    })
    .on('post', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num
    ]))
    .on('close'  , verifyClose(t))
})


test('test list issue comments', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 48
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.listComments(xtend(auth), org, repo, num, verifyData(t, testData[0]))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=0'
      , 'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=1'
    ]))
    .on('close'  , verifyClose(t))
})


test('test list multi-page issue comments', function (t) {
  t.plan(13)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 202
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [ { test3: 'data3' }, { test4: 'data4' } ], [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.listComments(xtend(auth), org, repo, num, verifyData(t, testData[0].concat(testData[1])))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=0'
      , 'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=1'
      , 'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=2'
    ]))
    .on('close'  , verifyClose(t))
})


test('test list no issue comments', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 1
    , testData = [ [] ]
    , server

  server = makeServer(testData)
    .on('ready', function () {
      ghissues.listComments(xtend(auth), org, repo, num, verifyData(t, []))
    })
    .on('request', verifyRequest(t, auth))
    .on('get', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=0'
    ]))
    .on('close'  , verifyClose(t))
})


test('test create new comment', function (t) {
  t.plan(8)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = 'comment body'
    , num      = 303
    , resp     = 'herpderp'
    , server

  server = makeServer(resp)
    .on('ready', function () {
      ghissues.createComment(xtend(auth), org, repo, num, testData, verifyData(t, resp))
    })
    .on('request', verifyRequest(t, auth))
    .on('request', function (req) {
      req.pipe(bl(function (err, data) {
        t.notOk(err, 'no error')
        t.deepEqual(JSON.parse(data.toString()), {body:testData}, 'got expected post data')
      }))
    })
    .on('post', verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments'
    ]))
    .on('close'  , verifyClose(t))
})
