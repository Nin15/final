const { Router } = require("express");
const blogModel = require("../models/blog.model");
const { isValidObjectId } = require("mongoose");
const { deleteFromCloudinary, upload } = require("../config/cloudinary.config");
const isAuth = require("../middleware/isAuth.middleware");

const blogRouter = Router();
/**
 * @swagger
 * /blogs/:
 *   get:
 *     summary: Get all blogs
 *     tags: [blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/blog'
 */

blogRouter.get("/", async (req, res) => {
  const blogs = await blogModel
    .find()
    .sort({ _id: -1 })
    .populate({ path: "author", select: "fullName email" });
  return res.status(200).json({ blogs });
});

/**
 * @swagger
 * /blogs/:
 *   blog:
 *     summary: Create a new blog
 *     tags: [blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Hello world!"
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: blog created successfully
 *       400:
 *         description: Content is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: content is required
 */
blogRouter.post("/", upload.single("avatar"), async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: "content is required" });
  }

  const filePath = req.file.path;

  await blogModel.create({ content, author: req.userId, avatar: filePath });
  return res.status(201).json({ message: "blog created successfully" });
});
/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: blog ID
 *     responses:
 *       200:
 *         description: blog deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: blog deleted successfully!
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized or no permission
 */
blogRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId) {
    return res.status(400).json({ message: "id is invalid" });
  }

  const blog = await blogModel.findById(id);
  if (blog.author.toString() !== req.userId) {
    return res.status(401).json({ message: "You don't have permission!" });
  }

  await blogModel.findByIdAndDelete(id);
  
  return res.status(200).json({ message: "blog deleted successfully!" });
});

/**
 * @swagger
 * /blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Updated content"
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: blog updated successfully!
 *                 blog:
 *                   $ref: '#/components/schemas/blog'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized or no permission
 */
blogRouter.put("/:id", upload.single("avatar"), async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "id is invalid" });
  }
  const { content } = req.body;
  const avatar = req.file ? req.file.path : undefined;
  const blog = await blogModel.findById(id);
  if (blog.author.toString() !== req.userId) {
    return res.status(401).json({ message: "You don't have permission!" });
  }
  const updateData = { content };
  if (avatar) updateData.avatar = avatar;

  const updated = await blogModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  return res
    .status(200)
    .json({ message: "blog updated successfully!", blog: updated });
});


/**
 * @swagger
 * /blogs/{id}/reactions:
 *   blog:
 *     summary: Add or remove a reaction (like/dislike) to a blog
 *     tags: [blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *                 example: like
 *     responses:
 *       200:
 *         description: Reaction updated
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: added successfully
 *       400:
 *         description: Wrong reaction type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: wrong reaction type
 *       401:
 *         description: Unauthorized
 */
blogRouter.post("/:id/reactions", isAuth, async (req, res) => {
  const id = req.params.id;
  const { type } = req.body;
  const blog = await blogModel.findById(id);
  const supportReactionType = ["like", "dislike"];
  if (!supportReactionType.includes(type)) {
    return res.status(400).json({ error: "wrong reaction type" });
  }
  const alreadyDislikedIndex = blog.reactions.dislikes.findIndex(
    (el) => el._id.toString() === req.userId
  );
  const alreadyLikedIndex = blog.reactions.likes.findIndex(
    (el) => el._id.toString() === req.userId
  );
  if (type === "like") {
    if (alreadyLikedIndex !== -1) {
      blog.reactions.likes.splice(alreadyLikedIndex, 1);
    } else {
      blog.reactions.likes.push(req.userId);
    }
  }
  if (type === "dislike") {
    if (alreadyDislikedIndex !== -1) {
      blog.reactions.dislikes.splice(alreadyDislikedIndex, 1);
    } else {
      blog.reactions.dislikes.push(req.userId);
    }
  }
  if (alreadyLikedIndex !== -1 && type === "dislike") {
    blog.reactions.likes.splice(alreadyLikedIndex, 1);
  }
  if (alreadyDislikedIndex !== -1 && type === "like") {
    blog.reactions.dislikes.splice(alreadyDislikedIndex, 1);
  }

  await blog.save();
  res.send("added successfully");
});
module.exports = blogRouter;
