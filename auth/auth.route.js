const { Router } = require("express");
const userSchema = require("../validation/user.validation");
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuth = require("../middleware/isAuth.middleware");
require("dotenv").config();

const authRouter = Router();

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Internal server error
 */

authRouter.post("/sign-up", async (req, res) => {
  try {
    const { error } = userSchema.validate(req.body || {});
    if (error) return res.status(400).json(error);

    const { fullName, email, password } = req.body;
    const existUser = await userModel.findOne({ email });
    if (existUser) return res.status(400).json({ message: "user already exist" });

    const hashedPass = await bcrypt.hash(password, 10);
    await userModel.create({ fullName, password: hashedPass, email });

    res.status(201).json({ message: "user registered successfully" });
  } catch (err) {
    console.error("SIGN-UP ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mySecret123
 *     responses:
 *       200:
 *         description: JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: email or password is invalid
 */

authRouter.post("/sign-in", async (req, res) => {
  console.log("BODY:", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password is required" });
  }

  const existUser = await userModel.findOne({ email }).select("password");
  if (!existUser) {
    return res.status(400).json({ message: "email or password is invalid" });
  }

  const isPassEqual = await bcrypt.compare(password, existUser.password);
  if (!isPassEqual) {
    return res.status(400).json({ message: "email or password is invalid" });
  }

  const payload = {
    userId: existUser._id,
  };

  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json(token);
});

/**
 * @swagger
 * /auth/current-user:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User object
 *       401:
 *         description: Unauthorized
 */

authRouter.get("/current-user", isAuth, async (req, res) => {
  const user = await userModel.findById(req.userId);
  res.json(user);
});



module.exports = authRouter;
