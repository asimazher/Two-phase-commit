const express = require("express");
const routerAccount = express.Router();
const Account = require('../models/Account');

// Create a new account

routerAccount.post("/create", async (req, res)=>{
    try {
        const { name, balance } = req.body;
    
        // Check if the account already exists
        const existingAccount = await Account.findOne({ name });
    
        if (existingAccount) {
          return res.status(400).json({ success: false, message: 'Account with this name already exists' });
        }
    
        // Create a new account
        const newAccount = new Account({ name, balance, pendingTransactions: [] });
        await newAccount.save();
    
        res.json({ success: true, message: 'Account created successfully', account: newAccount });
      } catch (error) {
        console.error('Error creating account:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
});

module.exports = routerAccount;
