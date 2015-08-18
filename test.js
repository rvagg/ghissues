const http           = require('http')
    , ghutils        = require('ghutils/test-util')
    , test           = require('tape')
    , xtend          = require('xtend')
    , bl             = require('bl')
    , ghissues       = require('./')


test('test list issues', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [
          {
              response : [ { test1: 'data1' }, { test2: 'data2' } ]
            , headers  : { link: '<https://api.github.com/repos/testorg/testrepo/issues?page=2>; rel="next"' }
          }
        , { response: [] }
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.list(xtend(auth), org, repo, ghutils.verifyData(t, testData[0].response))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues?page=1'
      , 'https://api.github.com/repos/testorg/testrepo/issues?page=2'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list multi-page issues', function (t) {
  t.plan(13)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [
          {
              response : [ { test1: 'data1' }, { test2: 'data2' } ]
            , headers  : { link: '<https://api.github.com/repos/testorg/testrepo/issues?page=2>; rel="next"' }
          }
        , {
              response : [ { test1: 'data3' }, { test2: 'data4' } ]
            , headers  : { link: '<https://api.github.com/repos/testorg/testrepo/issues?page=3>; rel="next"' }
          }
        , { response: [] }
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.list(xtend(auth), org, repo, ghutils.verifyData(t, testData[0].response.concat(testData[1].response)))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues?page=1'
      , 'https://api.github.com/repos/testorg/testrepo/issues?page=2'
      , 'https://api.github.com/repos/testorg/testrepo/issues?page=3'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list no issues', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = [ [] ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.list(xtend(auth), org, repo, ghutils.verifyData(t, []))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues?page=1'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test get issue by id', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 101
    , testData = { id: num, issue: 'body' }
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.get(xtend(auth), org, repo, num, ghutils.verifyData(t, testData))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test create new issue', function (t) {
  t.plan(9)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = { title: 'issue title', body: 'issue body' }
    , resp     = 'derp'
    , server

  server = ghutils.makeServer(resp)
    .on('ready', function () {
      ghissues.create(xtend(auth), org, repo, testData, ghutils.verifyData(t, resp))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('request', function (req) {
      req.pipe(bl(function (err, data) {
        t.notOk(err, 'no error')
        t.deepEqual(JSON.parse(data.toString()), testData, 'got expected post data')
      }))
    })
    .on('post', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list issue comments', function (t) {
  t.plan(10)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 48
    , testData = [ [ { test1: 'data1' }, { test2: 'data2' } ], [] ]
    , testData = [
          {
              response : [ { test1: 'data1' }, { test2: 'data2' } ]
            , headers  : { link: '<https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=2>; rel="next"' }
          }
        , { response: [] }
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.listComments(xtend(auth), org, repo, num, ghutils.verifyData(t, testData[0].response))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=1'
      , 'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=2'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list multi-page issue comments', function (t) {
  t.plan(13)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 202
    , testData = [
          {
              response : [ { test1: 'data1' }, { test2: 'data2' } ]
            , headers  : { link: '<https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=2>; rel="next"' }
          }
        , {
              response : [ { test1: 'data3' }, { test2: 'data4' } ]
            , headers  : { link: '<https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=3>; rel="next"' }
          }
        , { response: [] }
      ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.listComments(xtend(auth), org, repo, num, ghutils.verifyData(t, testData[0].response.concat(testData[1].response)))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=1'
      , 'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=2'
      , 'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=3'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test list no issue comments', function (t) {
  t.plan(7)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , num      = 1
    , testData = [ [] ]
    , server

  server = ghutils.makeServer(testData)
    .on('ready', function () {
      ghissues.listComments(xtend(auth), org, repo, num, ghutils.verifyData(t, []))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('get', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments?page=1'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})


test('test create new comment', function (t) {
  t.plan(9)

  var auth     = { user: 'authuser', token: 'authtoken' }
    , org      = 'testorg'
    , repo     = 'testrepo'
    , testData = 'comment body'
    , num      = 303
    , resp     = 'herpderp'
    , server

  server = ghutils.makeServer(resp)
    .on('ready', function () {
      ghissues.createComment(xtend(auth), org, repo, num, testData, ghutils.verifyData(t, resp))
    })
    .on('request', ghutils.verifyRequest(t, auth))
    .on('request', function (req) {
      req.pipe(bl(function (err, data) {
        t.notOk(err, 'no error')
        t.deepEqual(JSON.parse(data.toString()), {body:testData}, 'got expected post data')
      }))
    })
    .on('post', ghutils.verifyUrl(t, [
        'https://api.github.com/repos/testorg/testrepo/issues/' + num + '/comments'
    ]))
    .on('close'  , ghutils.verifyClose(t))
})
