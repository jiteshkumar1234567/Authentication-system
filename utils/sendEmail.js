const nodemailer = require("nodemailer");

module.exports = async (to, subject, html) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS  // App password
      }
    });

    // Send email
    await transporter.sendMail({
      from: `"Our App" <${process.env.EMAIL_USER}>`, // Sender name
      to, 
      subject,
      html, // Use HTML instead of text
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed:", err);
  }
};
