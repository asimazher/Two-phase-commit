const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true },
  pendingTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
