const assert = require('assert');
const app = require('../src/app');
const log4js = require('log4js');
const log = log4js.getLogger('index.js');
const mongoose = require('mongoose');

const username = 'username';
const email = 'username@nowhere.com';
const password = 'userpassword';

const username2 = 'username2';
const email2 = 'username2@nowhere.com';
const password2 = 'userpassword2';

describe('Home expenses server application tests', () => {
  before(function (done) {
    app.start(() => {
      this.agent = require('../src/agent');
      const User = mongoose.model('User');
      const Categories = mongoose.model('Category');
      User.remove({})
        .then(() => Categories.remove({}))
        .then(() => done());
    });
  });

  after(function (done) {
    app.shutdown(done);
  });

  describe('Wrong REST API call', () => {

    it('Wrong REST API path', function () {
      return this.agent.WrongAPI.wrong()
        .then(res => {
        })
        .catch(err => {
          assert.equal(err.response.statusCode, 404, 'wrong API path response code');
          assert.deepEqual(err.response.body, { errors: { error: { status: 404 }, message: 'Not Found' } }, 'wrong API path response body');
        });
    });

  });

  describe('User operations', () => {

    it('Login wrong user', function () {
      return this.agent.Auth.login(email, password + password)
        .then(res => { })
        .catch(err => {
          assert.equal(err.response.statusCode, 422, 'invalid email or password');
          assert.equal(err.response.body.errors['email or password'], 'is invalid', 'invalid email or password');
        })
        .then(res => this.agent.Auth.login('', password))
        .then(res => { })
        .catch(err => {
          assert.equal(err.response.statusCode, 422, 'invalid email');
          assert.equal(err.response.body.errors.email, 'can\'t be blank', 'invalid email');
        })
        .then(res => this.agent.Auth.login(email, ''))
        .then(res => { })
        .catch(err => {
          assert.equal(err.response.statusCode, 422, 'invalid password');
          assert.equal(err.response.body.errors.password, 'can\'t be blank', 'invalid password');
        });
    });

    it('Register user', function () {
      return this.agent.Auth.register(username, email, password)
        .then(res => {
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
        })
        .then(res => this.agent.Auth.register(username2, email2, password2))
        .then(res => {
          assert.equal(res.user.email, email2, 'email2');
          assert.equal(res.user.username, username2, 'username2');
        });
    });

    it('Login user', function () {
      return this.agent.Auth.login(email, password)
        .then(res => {
          this.token = res.user.token;
          this.user = res.user;
          this.agent.setToken(this.token);
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
        });
    });

    it('Get current user', function () {
      return this.agent.Auth.current()
        .then(res => {
          assert.equal(res.user.email, email, 'email');
          assert.equal(res.user.username, username, 'username');
          assert.equal(res.user.token, this.token, 'token');
        });
    });

    it('Change user properties', function () {
      this.user.password = password;
      return this.agent.Auth.save(this.user)
        .then(res => {
          assert.equal(res.user.email, this.user.email, 'email');
          assert.equal(res.user.username, this.user.username, 'username');
          this.token = res.user.token;
          this.agent.setToken(this.token);
        });
    });

    it('Logout current user', function () {
      this.user.password = password;
      return this.agent.Auth.logout()
        .then(res => {
          assert.equal(res.user.username, username, 'username');
        });
    });

    it('Delete user', function () {
      return wait(2000)
        .then(res =>
          this.agent.Auth.login(email, password))
        .then(res => {
          this.token = res.user.token;
          this.user = res.user;
          this.agent.setToken(this.token);
          assert.equal(res.user.email, email, 'email after login');
          assert.equal(res.user.username, username, 'username after login');
        })
        .then(res => this.agent.Auth.delete(this.user))
        .then(res => {
          assert.equal(res.toString(), ({}).toString(), 'No response for user removal');
          this.token = undefined;
          this.user = undefined;
          this.agent.setToken(this.token);
        })
        .then(res => this.agent.Auth.login(email2, password2))
        .then(res => {
          this.token2 = res.user.token;
          this.user2 = res.user;
          this.agent.setToken(this.token2);
          assert.equal(res.user.email, email2, 'email2');
          assert.equal(res.user.username, username2, 'username2');
        });
    });

  });

  describe('Categories operations', () => {

    it('Create new categories', function () {
      return this.agent.Categories.new('category 1')
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 1', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 0, 'Category 1 subcategories');
        })
        .then(res => this.agent.Categories.new('subcategory 1'))
        .then(res => {
          assert.equal(res.category.slug, 'subcategory-1', 'Subcategory 1 slug');
          assert.equal(res.category.title, 'subcategory 1', 'Subcategory 1 title');
          assert.equal(res.category.subcategories.length, 0, 'Subcategory 1 subcategories');
        })
        .then(res => this.agent.Categories.new('subcategory 2'))
        .then(res => {
          assert.equal(res.category.slug, 'subcategory-2', 'Subcategory 2 slug');
          assert.equal(res.category.title, 'subcategory 2', 'Subcategory 2 title');
          assert.equal(res.category.subcategories.length, 0, 'Subcategory 2 subcategories');
        });
    });

    it('Add sub categories', function () {
      return this.agent.Categories.addSubcategory('category-1', 'subcategory-1')
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 1', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 1, 'Category 1 subcategories');
          assert.equal(res.category.subcategories[0].slug, 'subcategory-1', 'Category 1 subcategories[0] slug');
          assert.equal(res.category.subcategories[0].title, 'subcategory 1', 'Category 1 subcategories[0] title');
        })
        .then(res => this.agent.Categories.addSubcategory('category-1', 'subcategory-2'))
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 1', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 2, 'Category 1 subcategories');
          assert.equal(res.category.subcategories[1].slug, 'subcategory-2', 'Category 1 subcategories[1] slug');
          assert.equal(res.category.subcategories[1].title, 'subcategory 2', 'Category 1 subcategories[1] title');
        })
        .then(res => this.agent.Categories.addSubcategory('category-1', 'subcategory-2'))
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 1', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 2, 'Category 1 subcategories');
          assert.equal(res.category.subcategories[1].slug, 'subcategory-2', 'Category 1 subcategories[1] slug');
          assert.equal(res.category.subcategories[1].title, 'subcategory 2', 'Category 1 subcategories[1] title');
        })
        .then(res => this.agent.Categories.addSubcategory('category-2', 'subcategory-2'))
        .catch(err => {
          assert.equal(err.response.statusCode, 404, 'category not found response code');
          assert.deepEqual(err.response.body, { errors: { error: { status: 404 }, message: 'Not Found' } }, 'category not found response body');
        })
        .then(res => this.agent.Categories.addSubcategory('category-1', 'subcategory-3'))
        .catch(err => {
          assert.equal(err.response.statusCode, 404, 'subcategory not found response code');
          assert.deepEqual(err.response.body, { errors: { error: { status: 404 }, message: 'Not Found' } }, 'subcategory not found response body');
        });
    });

    it('Update category title', function () {
      return this.agent.Categories.update('category-1', 'category 2')
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 2', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 2, 'Category 1 subcategories');
        })
        .then(res => this.agent.Categories.update('category-1', undefined))
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 2', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 2, 'Category 1 subcategories');
        });
    });

    it('Get all categories', function () {
      return this.agent.Categories.all()
        .then(res => {
          assert.equal(res.categories.length, 3, 'categories length');
          assert.equal(res.categories[0].slug, 'category-1', 'Category 1 slug');
          assert.equal(res.categories[0].title, 'category 2', 'Category 1 title');
          assert.equal(res.categories[0].subcategories.length, 2, 'Category 1 subcategories');
          assert.equal(res.categories[0].subcategories[0].slug, 'subcategory-1', 'Category 1 subcategories[0] slug');
          assert.equal(res.categories[0].subcategories[0].title, 'subcategory 1', 'Category 1 subcategories[0] title');
          assert.equal(res.categories[0].subcategories[1].slug, 'subcategory-2', 'Category 1 subcategories[1] slug');
          assert.equal(res.categories[0].subcategories[1].title, 'subcategory 2', 'Category 1 subcategories[1] title');
          assert.equal(res.categories[1].slug, 'subcategory-1', 'Subcategory 1 slug');
          assert.equal(res.categories[1].title, 'subcategory 1', 'Subcategory 1 title');
          assert.equal(res.categories[2].slug, 'subcategory-2', 'Subcategory 2 slug');
          assert.equal(res.categories[2].title, 'subcategory 2', 'Subcategory 2 title');
        });
    });

    it('Remove subcategory', function () {
      return this.agent.Categories.removeSubcategory('category-1', 'subcategory-1')
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 2', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 1, 'Category 1 subcategories');
          assert.equal(res.category.subcategories[0].slug, 'subcategory-2', 'Category 1 subcategories[0] slug');
          assert.equal(res.category.subcategories[0].title, 'subcategory 2', 'Category 1 subcategories[0] title');
        });
    });

    it('Get category by name', function () {
      return this.agent.Categories.byName('category-1')
        .then(res => {
          assert.equal(res.category.slug, 'category-1', 'Category 1 slug');
          assert.equal(res.category.title, 'category 2', 'Category 1 title');
          assert.equal(res.category.subcategories.length, 1, 'Category 1 subcategories');
          assert.equal(res.category.subcategories[0].slug, 'subcategory-2', 'Category 1 subcategories[0] slug');
          assert.equal(res.category.subcategories[0].title, 'subcategory 2', 'Category 1 subcategories[0] title');
        });
    });


    it('Delete category', function () {
      return this.agent.Categories.delete('subcategory-2')
        .then(res => this.agent.Categories.all())
        .then(res => {
          assert.equal(res.categories.length, 2, 'categories length');
          assert.equal(res.categories[0].slug, 'category-1', 'Category 1 slug');
          assert.equal(res.categories[0].title, 'category 2', 'Category 1 title');
          assert.equal(res.categories[0].subcategories.length, 0, 'Category 1 subcategories');
          assert.equal(res.categories[1].slug, 'subcategory-1', 'Subcategory 1 slug');
          assert.equal(res.categories[1].title, 'subcategory 1', 'Subcategory 1 title');
        })
        .then(res => this.agent.Categories.delete('subcategory-1'))
        .then(res => this.agent.Categories.all())
        .then(res => {
          assert.equal(res.categories.length, 1, 'categories length');
          assert.equal(res.categories[0].slug, 'category-1', 'Category 1 slug');
          assert.equal(res.categories[0].title, 'category 2', 'Category 1 title');
          assert.equal(res.categories[0].subcategories.length, 0, 'Category 1 subcategories');
        })
        .then(res => this.agent.Categories.delete('category-1'))
        .then(res => this.agent.Categories.all())
        .then(res => {
          assert.equal(res.categories.length, 0, 'categories length');
        });
    });

  });
});


function wait(ms) {
  const p = new Promise(function (resolve, reject) {
    setTimeout(function () { resolve(); }, ms);
  });
  return p;
}
