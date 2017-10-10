var router = require('express').Router();
var mongoose = require('mongoose');
var Category = mongoose.model('Category');
var User = mongoose.model('User');
var auth = require('../auth');

router.param('category', function (req, res, next, slug) {
  Category.findOne({ slug: slug })
    .then(function (category) {
      if (!category) { return res.sendStatus(404); }

      req.category = category;

      return next();
    }).catch(next);
});

router.param('subcategory', function (req, res, next, slug) {
  Category.findOne({ slug: slug })
    .then(function (category) {
      if (!category) { return res.sendStatus(404); }

      req.subcategory = category;

      return next();
    }).catch(next);
});

router.get('/', auth.optional, function (req, res, next) {
  var query = {};
  return Promise.all([
    Category.find(query)
      .sort({ title: 'asc' })
      .populate('subcategories')
      .exec(),
    Category.count(query).exec()
  ]).then(function (results) {
    var categories = results[0];
    var categoriesCount = results[1];
    return res.json({
      categories: categories,
      categoriesCount: categoriesCount
    });
  }).catch(next);
});

router.post('/', auth.required, function (req, res, next) {
  var category = new Category(req.body.category);
  return category.save().then(function () {
    return category.populate('subcategories').execPopulate()
      .then(function (c) {
        return res.json({ category: c.toJSON() });
      }).catch(next);
  }).catch(next);
});

router.get('/:category', auth.optional, function (req, res, next) {
  return req.category.populate('subcategories').execPopulate()
    .then(function (c) {
      return res.json({ category: c.toJSON() });
    }).catch(next);
});

router.put('/:category', auth.required, function (req, res, next) {
  if (typeof req.body.category.title !== 'undefined') {
    req.category.title = req.body.category.title;
  }

  req.category.save().then(function (category) {
    return req.category.populate('subcategories').execPopulate()
      .then(function (c) {
        return res.json({ category: c.toJSON() });
      }).catch(next);
  }).catch(next);
});

router.delete('/:category', auth.required, function (req, res, next) {
  removeFromAllSubcategory()
  Category.find({subcategories: {$all:[req.category._id]}})
  .exec()
  .then(function(results) {
    Promise.all(results.map(function(c) {
      c.subcategories = c.subcategories.filter(function (s) {
        return !(s.toHexString() === req.category._id.toHexString())
      });
      return c.save();
    }))
    .then(function() {
      req.category.remove()
    })
    .then(function() {
      return res.sendStatus(204);
    });
  })
  .catch(next);
});

router.post('/:category/subcategories/:subcategory', auth.required, function (req, res, next) {
  return req.category.populate('subcategories').execPopulate()
    .then(function (c) {
      var indx = c.subcategories.findIndex(function (element, index, array) {
        return element.slug === req.subcategory.slug
      });
      if (indx === -1) {
        req.category.subcategories.push(req.subcategory);
        return req.category.save().then(function (c2) {
          return res.json({ category: c2.toJSON() });
        });
      }
      return res.json({ category: c.toJSON() });
    }).catch(next);

  req.category.populate('subcategories').execPopulate().then(function (category) {

  }).catch(next);
});

router.delete('/:category/subcategories/:subcategory', auth.required, function (req, res, next) {
  req.category.subcategories = req.category.subcategories.filter(function (element) {
    return !(element.toHexString() === req.subcategory._id.toHexString())
  });
  return req.category.save().then(function (c) {
    return c.populate('subcategories').execPopulate()
      .then(function (c2) {
        return res.json({ category: c2.toJSON() });
      }).catch(next);
  }).catch(next);
});

function removeFromAllSubcategory (subcategory) {

};


module.exports = router;
