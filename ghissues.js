import { ghget, ghpost, lister } from 'ghutils'

const defaultApiUrl = 'https://api.github.com'

export async function list (auth, org, repo, options = {}) {
  const apiUrl = options._apiUrl || defaultApiUrl
  const url = `${apiUrl}/repos/${org}/${repo}/issues`
  return lister(auth, url, options)
}

export async function get (auth, org, repo, num, options = {}) {
  const apiUrl = options._apiUrl || defaultApiUrl
  const url = `${apiUrl}/repos/${org}/${repo}/issues/${num}`
  const { data } = await ghget(auth, url, options)
  return data
}

export async function create (auth, org, repo, data, options = {}) {
  const apiUrl = options._apiUrl || defaultApiUrl
  const url = `${apiUrl}/repos/${org}/${repo}/issues`
  const { data: result } = await ghpost(auth, url, data, options)
  return result
}

export async function listComments (auth, org, repo, num, options = {}) {
  const apiUrl = options._apiUrl || defaultApiUrl
  const url = `${apiUrl}/repos/${org}/${repo}/issues/${num}/comments`
  return lister(auth, url, options)
}

export async function createComment (auth, org, repo, num, body, options = {}) {
  const apiUrl = options._apiUrl || defaultApiUrl
  const url = `${apiUrl}/repos/${org}/${repo}/issues/${num}/comments`
  const { data } = await ghpost(auth, url, { body }, options)
  return data
}
