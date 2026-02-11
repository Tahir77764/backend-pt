import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // You can change this to your preferred service
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

// POST /api/contact - Send contact email
router.post("/", async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required." });
    }

    try {
        // 1. Send Email to Admin
        const mailOptions = {
            from: `"${name}" <${email}>`, // sender address
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // list of receivers
            subject: `New Contact Inquiry: ${subject || "No Subject"}`, // Subject line
            html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        // 2. Optional: Send Auto-reply to User
        const replyOptions = {
            from: `"VT Printz" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "We received your message - VT Printz",
            html: `
            <h3>Hello ${name},</h3>
            <p>Thank you for reaching out to VT Printz. We have received your message and will get back to you shortly.</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>VT Printz Team</strong></p>
        `
        };

        // We don't await this to speed up response, or we catch error silently
        transporter.sendMail(replyOptions).catch(err => console.error("Auto-reply failed:", err));

        res.status(200).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
});

export default router;
