// const { default: mongoose } = require("mongoose");
// require("dotenv").config();

// const connectToDb = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected successfully!")
//   } catch (e) {
//     console.log("Couldn't connect :(");
//   }
// };

// module.exports = connectToDb;

const mongoose = require("mongoose");

let isConnected = false; // Track connection across invocations

const connectToDb = async () => {
  if (isConnected) {
    // Prevent multiple connections in serverless
    return;
  }

  try {
    mongoose.set("strictQuery", false); // Optional but helps with deprecation warnings
    const db = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err; // Let the calling function catch and handle it
  }
};

module.exports = connectToDb;
