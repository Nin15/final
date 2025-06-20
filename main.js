const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("uploads"));
const userRouter = require("./users/users.router");
const connectToDb = require("./db/db");
const authRouter = require("./auth/auth.route");
const isAuth = require("./middleware/isAuth.middleware");
const blogRouter = require("./blogs/blogs.router");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const storage = require("./config/cloudinary.config");
const { upload } = require("./config/cloudinary.config");
const swagger = require("./swagger");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

const specs = swaggerJSDoc(swagger);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
// const storage = multer.diskStorage({
//   desination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

app.get("/", (req, res) => {
  res.send("hello world");
});
app.use(cors());
app.use("/blogs", isAuth, blogRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.post("/upload", upload.single("image"), (req, res) => {
  return res.send(req.file);
});

//! !!!
connectToDb().then((res) => {
  app.listen(3000, () => {
    console.log("server running on http://localhost:3000");
  });
});
