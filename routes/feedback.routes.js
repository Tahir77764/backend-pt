import express from "express";
import Feedback from "../models/Feedback.js";
import adminAuth from "../middlewares/adminAuth.js";

const router = express.Router();

// USER: submit feedback
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: "All fields required" });

  // Prevent duplicate submission
  const existing = await Feedback.findOne({ email, message });
  if (existing) {
    return res.status(409).json({ message: "You have already submitted this exact feedback." });
  }

  const feedback = await Feedback.create({ name, email, message });
  res.status(201).json(feedback);
});

// USER: read replied feedback
router.get("/public", async (req, res) => {
  const data = await Feedback.find().sort({ createdAt: -1 });
  res.json(data);
});

// ADMIN: read all feedback
router.get("/", async (req, res) => {
  const data = await Feedback.find().sort({ createdAt: -1 });
  res.json(data);
});

// ADMIN: reply
// router.patch("/:id/reply", adminAuth, async (req, res) => {
//   const updated = await Feedback.findByIdAndUpdate(
//     req.params.id,
//     { adminReply: req.body.adminReply, status: "replied" },
//     { new: true }
//   );
//   res.json(updated);
// });


// ADMIN: update feedback (status / reply / delete reply)
// ADMIN: update feedback (status / reply / delete reply)
router.patch("/:id", adminAuth, async (req, res) => {
  const { status, adminReply, deleteReply } = req.body;

  const update = {};

  if (status) update.status = status;

  if (adminReply !== undefined) {
    update.adminReply = adminReply;
    update.status = "replied";
  }

  if (deleteReply) {
    update.adminReply = "";
    update.status = "pending";
  }

  const updated = await Feedback.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );

  res.json(updated);
});


// ADMIN: delete
router.delete("/:id", adminAuth, async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
