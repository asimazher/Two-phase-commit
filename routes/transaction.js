//mutiple transaction and rollback with TWO Phase Commit

const express = require('express');
const routerTransaction = express.Router();
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

var Fawn = require("fawn");

var mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/twoPhase");
Fawn.init(mongoose);

// Fawn.init("mongodb://127.0.0.1:27017/twoPhase");

routerTransaction.post('/perform', async (req, res) => {
    try {
      const { source, destination, value } = req.body;
  
      var task = new Fawn.Task();
  
      // Create a new transaction
      const newTransaction = await Transaction.create({ source, destination, value, state: 'initial' });
  
       // Perform operations within the transaction
       task.update('Account', { name: source, pendingTransactions: { $ne: newTransaction._id } }, { $inc: { balance: -value }, $push: { pendingTransactions: newTransaction._id } })
        .update('Account', { name: destination, pendingTransactions: { $ne: newTransaction._id } }, { $inc: { balance: value }, $push: { pendingTransactions: newTransaction._id } })
        .run()

    // Set transaction state to committed
    task.update('Transaction', { _id: newTransaction._id }, { $set: { state: 'committed' } });

    // Remove pending transaction from accounts
    task.update('Account', { name: source }, { $pull: { pendingTransactions: newTransaction._id } })
        .update('Account', { name: destination }, { $pull: { pendingTransactions: newTransaction._id } })
        .run();

    // Set transaction state to done
    task.update('Transaction', { _id: newTransaction._id }, { $set: { state: 'done' } });

    // Execute the transaction
    await task.run();
  
      res.json({ success: true, message: 'Transaction completed successfully' });
    } catch (error) {
      console.error('Error processing transaction:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

module.exports = routerTransaction;