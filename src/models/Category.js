var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var slug = require('slug');

var CategorySchema = new mongoose.Schema({
  slug: { type: String, lowercase: true, unique: true, index: true },
  title: String,
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
}, { timestamps: true });



CategorySchema.plugin(uniqueValidator, { message: 'is already taken' });

CategorySchema.pre('validate', function (next) {
  if (!this.slug) { this.slugify(); }
  next();
});

CategorySchema.methods.slugify = function () { this.slug = slug(this.title); };

CategorySchema.methods.populatePromised = function () {
  return new Promise((resolve, reject) => {
    this
      .populate('subcategories')
      .execPopulate()
      .then(c => { resolve(c); });
  });
};

CategorySchema.methods.toJSONPopulatedPromised = function () {
  return new Promise((resolve, reject) => {
    this
      .populate('subcategories')
      .execPopulate()
      .then(category => {
        Promise.all(category.subcategories.map(subcategory => {
          return subcategory.toJSONPopulatedPromised()
        })).then(subcategories => {
          resolve({
            slug: category.slug,
            title: category.title,
            subcategories: subcategories,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          });
        });
      });
  })
};

mongoose.model('Category', CategorySchema);
