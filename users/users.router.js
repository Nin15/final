const { Router } = require("express");
const userModel = require("../models/user.model");
const { upload, deleteFromCloudinary } = require("../config/cloudinary.config");
const isAuth = require("../middleware/isAuth.middleware");

const userRouter = Router();

/**
 * @swagger
 * /users/:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

userRouter.get("/", async (req, res) => {
  const users = await userModel.find().sort({ _id: -1 });
  return res.status(200).json(users.populate());
});
/**
 * @swagger
 * /users/:
 *   put:
 *     summary: Update current user (email and avatar)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user updated successfully!
 *       401:
 *         description: Unauthorized
 */

// ...existing code...
userRouter.put("/", isAuth, upload.single("avatar"), async (req, res) => {
  const id = req.userId;
  const { email } = req.body;

  const filePath = req.file.path;

  await userModel.findByIdAndUpdate(id, { email, avatar: filePath });
  await deleteFromCloudinary(req.file.filename.split("/")[1]);
  return res.status(200).json({ message: "user updated successfully!" });
});

module.exports = userRouter;
