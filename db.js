const mongoose = require("mongoose");

// Access your MongoDB connection string from secrets
//const mongoURI = process.env.MONGODB_URI;
const mongoURI = process.env.MONGODB_URI;

const initializeDatabase = async () => {
  try {
    const connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (connection) {
      console.log("connected succesfully");
    }
  } catch (error) {
    console.log("connection failed", error);
  }
};

module.exports = { initializeDatabase };
// mongoose
//   .connect(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('Connected to MongoDB')
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error)
//   })
