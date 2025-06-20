const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
    lowercase: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
    select: false, //! never take the pass
  },
  posts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "post",
    default: [],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  avatar: {
    type: String,
  }
});

module.exports = mongoose.model("user", userSchema);
