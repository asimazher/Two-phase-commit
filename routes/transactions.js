//mutiple transaction and rollback with TWO Phase Commit

const express = require('express');
const routerTransaction = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

routerTransaction.post('/perform', async (req, res) => {
  try {
    // Create a new transaction
    const newTransaction = await Transaction.create(req.body);

    // Set transaction state to pending
    newTransaction.state = 'pending';
    await newTransaction.save();

    // Apply transaction to both accounts
    const sourceAccount = await Account.findOneAndUpdate(
      { name: newTransaction.source, pendingTransactions: { $ne: newTransaction._id } },
      { $inc: { balance: -newTransaction.value }, $push: { pendingTransactions: newTransaction._id } },
      { new: true }
    );

    const destinationAccount = await Account.findOneAndUpdate(
      { name: newTransaction.destination, pendingTransactions: { $ne: newTransaction._id } },
      { $inc: { balance: newTransaction.value }, $push: { pendingTransactions: newTransaction._id } },
      { new: true }
    );

    // Set transaction state to committed
    newTransaction.state = 'committed';
    await newTransaction.save();

    // Remove pending transaction from accounts
    await Account.updateOne({ name: newTransaction.source }, { $pull: { pendingTransactions: newTransaction._id } });
    await Account.updateOne({ name: newTransaction.destination }, { $pull: { pendingTransactions: newTransaction._id } });

    // Set transaction state to done
    newTransaction.state = 'done';
    await newTransaction.save();

    res.json({ success: true, message: 'Transaction completed successfully' });
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    res.status(500).json({ success: false, message: 'Internal server error' });

    // if any error occurs rollback the transactions from both accounts
    // create a new transaction and performreverse transaction

    const newTransaction = await Transaction.create(req.body)


    const sourceAccount = await Account.findOneAndUpdate(
      { name: newTransaction.source, pendingTransactions: { $ne: newTransaction._id } },
      { $inc: { balance: newTransaction.value }, $push: { pendingTransactions: newTransaction._id } },
      { new: true }
    );

    const destinationAccount = await Account.findOneAndUpdate(
      { name: newTransaction.destination, pendingTransactions: { $ne: newTransaction._id } },
      { $inc: { balance: -newTransaction.value }, $push: { pendingTransactions: newTransaction._id } },
      { new: true }
    );

  }
});

module.exports = routerTransaction;