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
  if (!this.subcategories) { this.subcategories = []; }
  next();
});

CategorySchema.methods.slugify = function () { this.slug = slug(this.title); };

CategorySchema.methods.populatePromised = function () {
  return new Promise((resolve, reject) => {
    this
      .populate('subcategories')
      .execPopulate()
      .then(c => { resolve(c); })
      .catch(err => reject(err));
  });
};

CategorySchema.methods.toJSONPopulatedPromised = function () {
  return new Promise((resolve, reject) => {
    this
      .populate('subcategories')
      .execPopulate()
      .then(category => {
        resolve({
          slug: category.slug,
          title: category.title,
          subcategories: category.subcategories,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        });
      })
      .catch(err => reject(err));
  })
};

mongoose.model('Category', CategorySchema);
