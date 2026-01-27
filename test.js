import { test } from 'node:test'
import assert from 'node:assert'
import { createMockServer, createMockServerWithHandler } from 'ghutils/test-util'
import * as ghissues from './ghissues.js'

test('list issues', async () => {
  const auth = { token: 'test-token' }
  const testData = [{ id: 1, title: 'Issue 1' }, { id: 2, title: 'Issue 2' }]

  const server = await createMockServer({ response: testData })
  try {
    const results = await ghissues.list(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, testData)
    assert.strictEqual(server.requests.length, 1)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/issues'))
    assert.strictEqual(server.requests[0].headers.authorization, 'Bearer test-token')
  } finally {
    await server.close()
  }
})

test('list issues with pagination', async () => {
  const auth = { token: 'test-token' }
  const page1 = [{ id: 1 }, { id: 2 }]
  const page2 = [{ id: 3 }, { id: 4 }]

  let requestCount = 0
  const mock = await createMockServerWithHandler((req, res) => {
    requestCount++
    const port = mock.address().port
    if (requestCount === 1) {
      res.setHeader('link', `<http://127.0.0.1:${port}/page2>; rel="next"`)
      res.end(JSON.stringify(page1))
    } else {
      res.end(JSON.stringify(page2))
    }
  })

  try {
    const results = await ghissues.list(auth, 'testorg', 'testrepo', {
      _apiUrl: mock.baseUrl
    })
    assert.deepStrictEqual(results, [...page1, ...page2])
    assert.strictEqual(requestCount, 2)
  } finally {
    await mock.close()
  }
})

test('get issue by number', async () => {
  const auth = { token: 'test-token' }
  const testData = { id: 101, title: 'Test Issue', body: 'Issue body' }

  const server = await createMockServer({ response: testData })
  try {
    const result = await ghissues.get(auth, 'testorg', 'testrepo', 101, {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, testData)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/issues/101'))
  } finally {
    await server.close()
  }
})

test('create issue', async () => {
  const auth = { token: 'test-token' }
  const issueData = { title: 'New Issue', body: 'Issue description' }
  const responseData = { id: 123, ...issueData }

  const server = await createMockServer({ response: responseData })
  try {
    const result = await ghissues.create(auth, 'testorg', 'testrepo', issueData, {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, responseData)
    assert.strictEqual(server.requests[0].method, 'POST')
    assert.deepStrictEqual(server.requests[0].body, issueData)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/issues'))
  } finally {
    await server.close()
  }
})

test('list issue comments', async () => {
  const auth = { token: 'test-token' }
  const comments = [{ id: 1, body: 'Comment 1' }, { id: 2, body: 'Comment 2' }]

  const server = await createMockServer({ response: comments })
  try {
    const results = await ghissues.listComments(auth, 'testorg', 'testrepo', 42, {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, comments)
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/issues/42/comments'))
  } finally {
    await server.close()
  }
})

test('create comment', async () => {
  const auth = { token: 'test-token' }
  const commentBody = 'This is a comment'
  const responseData = { id: 456, body: commentBody }

  const server = await createMockServer({ response: responseData })
  try {
    const result = await ghissues.createComment(auth, 'testorg', 'testrepo', 42, commentBody, {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(result, responseData)
    assert.strictEqual(server.requests[0].method, 'POST')
    assert.deepStrictEqual(server.requests[0].body, { body: commentBody })
    assert.ok(server.requests[0].url.includes('/repos/testorg/testrepo/issues/42/comments'))
  } finally {
    await server.close()
  }
})

test('list issues returns empty array', async () => {
  const auth = { token: 'test-token' }

  const server = await createMockServer({ response: [] })
  try {
    const results = await ghissues.list(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.deepStrictEqual(results, [])
  } finally {
    await server.close()
  }
})

test('auth header is correctly set', async () => {
  const auth = { token: 'my-secret-token' }
  const testData = [{ id: 1 }]

  const server = await createMockServer({ response: testData })
  try {
    await ghissues.list(auth, 'testorg', 'testrepo', {
      _apiUrl: server.baseUrl
    })
    assert.strictEqual(server.requests[0].headers.authorization, 'Bearer my-secret-token')
    assert.strictEqual(server.requests[0].headers.accept, 'application/vnd.github+json')
  } finally {
    await server.close()
  }
})
