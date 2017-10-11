var mongoose = require('mongoose');

var ExpenseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  value: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

mongoose.model('Expense', ExpenseSchema);
