const router = require('express').Router();
const mongoose = require('mongoose');
const Category = mongoose.model('Category');
const User = mongoose.model('User');
const auth = require('../auth');

// Prepare :category parameter
router.param('category', (req, res, next, slug) => {
  Category
    .findOne({ slug: slug })
    .then(category => {
      if (!category) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
      req.category = category;
      return next();
    })
    .catch(next);
});

// Prepare :subcategory parameter
router.param('subcategory', (req, res, next, slug) => {
  Category
    .findOne({ slug: slug })
    .then(subcategory => {
      if (!subcategory) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
      };
      req.subcategory = subcategory;
      return next();
    })
    .catch(next);
});

// Get all categories
router.get('/', auth.required, (req, res, next) => {
  const query = {};
  Category
    .find(query)
    .sort({ title: 'asc' })
    .exec()
    .then(categories => {
      return Promise.all(categories.map(category => {
        return category.toJSONPopulatedPromised()
      }));
    })
    .then(categories => { return res.json({ categories: categories }); })
    .catch(next);
});

// Add new category
router.post('/', auth.required, (req, res, next) => {
  new Category(req.body.category)
    .save()
    .then(category => { return category.toJSONPopulatedPromised(); })
    .then(category => { return res.json({ category: category }) })
    .catch(next);
});

// Get selected category
router.get('/:category', auth.required, (req, res, next) => {
  req.category
    .toJSONPopulatedPromised()
    .then(category => { return res.json({ category: category }); })
    .catch(next);
});

// Update category title
router.put('/:category', auth.required, (req, res, next) => {
  if (typeof req.body.category.title !== 'undefined') req.category.title = req.body.category.title;
  req.category
    .save()
    .then(category => { return category.toJSONPopulatedPromised(); })
    .then(category => { return res.json({ category: category }); })
    .catch(next);
});

// Delete selected category
router.delete('/:category', auth.required, (req, res, next) => {
  Category
    .find({ subcategories: { $all: [req.category._id] } })
    .exec()
    .then(results => {
      return Promise.all(results.map(category => {
        category.subcategories = category.subcategories.filter(subcategories => {
          return !(subcategories.toHexString() === req.category._id.toHexString())
        });
        return category.save();
      }));
    })
    .then(() => { req.category.remove() })
    .then(() => { return res.sendStatus(204); })
    .catch(next);
});


// Add subcategory to selected category
router.post('/:category/subcategories/:subcategory', auth.required, (req, res, next) => {
  return req.category.populatePromised()
    .then(c => {
      var indx = c.subcategories.findIndex((element, index, array) => { return element.slug === req.subcategory.slug });
      if (indx === -1) {
        req.category.subcategories.push(req.subcategory);
        return req.category
          .save()
          .then(category => { return category.toJSONPopulatedPromised(); })
          .then(category => { return res.json({ category: category }); })
          .catch(next)
      }
      return c
        .toJSONPopulatedPromised()
        .then(category => { return res.json({ category: category }); })
        .catch(next);
    })
    .catch(next);
});

// Remove subcategory from selected category
router.delete('/:category/subcategories/:subcategory', auth.required, (req, res, next) => {
  req.category.subcategories = req.category.subcategories.filter(element => {
    return !(element.toHexString() === req.subcategory._id.toHexString())
  });
  return req.category
    .save()
    .then(category => { return category.toJSONPopulatedPromised(); })
    .then(category => { return res.json({ category: category }); })
    .catch(next);
});

module.exports = router;
