const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./db");
const routerAccount = require("./routes/accounts");
const routerTransaction = require("./routes/transactions");
// const user = require("./routes/user");

const app = express();

dotenv.config();
connectDb();

app.use(express.json());

app.use('/api/account', routerAccount);
app.use('/api/transaction', routerTransaction);


app.listen(process.env.PORT, () => {
  console.log(`Server listening to port ${process.env.PORT}`);
});
