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
  if (!this.slug) {
    this.slugify();
  }
  if (!this.subcategories) {
    this.subcategories = [];
  }
  next();
});

CategorySchema.methods.slugify = function () {
  this.slug = slug(this.title);
};

CategorySchema.methods.toJSON = function () {
  return {
    slug: this.slug,
    title: this.title,
    subcategories: this.subcategories,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
};

mongoose.model('Category', CategorySchema);