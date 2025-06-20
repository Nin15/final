const { default: mongoose } = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    avatar: {
      type: String,
    },
    reactions: {
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
      dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blog", blogSchema);
