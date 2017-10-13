const superagentPromise = require('superagent-promise');
const _superagent = require('superagent');
const config = require('nconf');

const API_PORT = config.get('express:port');

const superagent = superagentPromise(_superagent, global.Promise);
const API_ROOT = `http://localhost:${API_PORT}/api`;

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
  if (token) {
    req.set('authorization', `Token ${token}`);
  }
}

const requests = {
  del: url =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: url =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url, body) =>
    superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (url, body) =>
    superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody)
};

const Auth = {
  current: () =>
    requests.get('/user'),
  login: (email, password) =>
    requests.post('/users/login', { user: { email, password } }),
  register: (username, email, password) =>
    requests.post('/users', { user: { username, email, password } }),
  save: user =>
    requests.put('/user', { user }),
  delete: user =>
    requests.del('/user', { user })
};

const Categories = {
  all: () =>
    requests.get(`/categories`),
  byName: (name) =>
    requests.get(`/categories/${name}`),
  new: title =>
    requests.post(`/categories`, { category: { title: title } }),
  update: (slug, title) =>
    requests.put(`/categories/${slug}`, { category: { title: title } }),
  update: (slug, title) =>
    requests.del(`/categories/${slug}`),
  addSubcategory: (category, subcategory) =>
    requests.post(`/categories/${category}/subcategories/${subcategory}`),
  removeSubcategory: (category, subcategory) =>
    requests.del(`/categories/${category}/subcategories/${subcategory}`)
};
module.exports = {
  Auth,
  Categories,
  setToken: _token => { token = _token; }
};
