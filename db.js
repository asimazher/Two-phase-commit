const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Database connected at ${conn.connection.host}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};
module.exports = connectDb;
