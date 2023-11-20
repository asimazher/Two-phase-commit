const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  value: { type: Number, required: true },
  state: { type: String, enum: ['initial', 'pending', 'committed', 'done'], default: 'initial' },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
