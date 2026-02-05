const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");


// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exist = await User.findOne({ email });
    if (exist)
      return res.json({ success: false, message: "User already exists" });

    // Hash password and create user
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });

    // Verification link
    const verifyLink = `http://localhost:3000/auth/verify/${user._id}`;

    // HTML Email Template
    const htmlContent = `
      <div style="font-family: 'Roboto', sans-serif; max-width:600px; margin:0 auto; padding:30px; background:#f9f9f9; border-radius:12px; text-align:center; color:#333;">
        <img src="https://png.pngtree.com/png-vector/20240301/ourmid/pngtree-vector-eagle-logo-design-with-an-angry-expression-png-image_11885297.png" alt="Logo" width="100" style="margin-bottom:20px;">
        <h2 style="color:#764ba2; font-size:24px; margin-bottom:10px;">Welcome to Our App, ${name} 🎉</h2>
        <p style="font-size:16px; color:#555; line-height:1.5; margin-bottom:30px;">
          Thank you for signing up! To activate your account, please verify your email by clicking the button below.
        </p>
        <a href="${verifyLink}" 
           style="
             display:inline-block;
             padding:14px 28px;
             background: linear-gradient(135deg, #667eea, #764ba2);
             color:#fff;
             text-decoration:none;
             border-radius:8px;
             font-weight:600;
             font-size:16px;
             margin-bottom:20px;
           ">
          Verify Email
        </a>
        <p style="font-size:14px; color:#999; line-height:1.5;">
          If you did not create an account, you can safely ignore this email.
        </p>
        <p style="font-size:12px; color:#bbb; margin-top:20px;">
          &copy; ${new Date().getFullYear()} Our App. All rights reserved.
        </p>
      </div>
    `;

    await sendEmail(email, "Verify Your Account ✅", htmlContent);

    res.json({ success: true, message: "Signup successful! Check email to verify 📩" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Signup error" });
  }
};

// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isVerified: true });
  res.render("verify"); // verify.ejs page open hogi
};


// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success:false, message:"User not found" });

    if (!user.isVerified)
      return res.json({ success:false, message:"Please verify email first" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success:false, message:"Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

    // 🔥 COOKIE SET (MOST IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict"
    });

    res.json({
      success:true,
      message:"Login successful 🎉",
      redirect:"/auth/dashboard"
    });

  } catch (err) {
    res.json({ success:false, message:"Login error" });
  }
};



// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.json({ success: false, message: "User not found" });

    // Create a reset token (for simplicity using _id; you can also generate a random token)
    user.resetToken = user._id;
    await user.save();

    const link = `http://localhost:3000/auth/reset/${user._id}`;

    // HTML email template
    const htmlContent = `
      <div style="font-family: 'Roboto', sans-serif; max-width:600px; margin:0 auto; padding:30px; background:#f9f9f9; border-radius:12px; text-align:center; color:#333;">
        <img src="https://png.pngtree.com/png-vector/20240301/ourmid/pngtree-vector-eagle-logo-design-with-an-angry-expression-png-image_11885297.png" alt="Logo" width="100" style="margin-bottom:20px;">
        <h2 style="color:#764ba2; font-size:24px; margin-bottom:10px;">Reset Your Password 🔑</h2>
        <p style="font-size:16px; color:#555; line-height:1.5; margin-bottom:30px;">
          You requested a password reset. Click the button below to set a new password:
        </p>
        <a href="${link}" 
           style="
             display:inline-block;
             padding:14px 28px;
             background: linear-gradient(135deg, #667eea, #764ba2);
             color:#fff;
             text-decoration:none;
             border-radius:8px;
             font-weight:600;
             font-size:16px;
             margin-bottom:20px;
           ">
          Reset Password
        </a>
        <p style="font-size:14px; color:#999; line-height:1.5;">
          If you did not request this, you can safely ignore this email.
        </p>
        <p style="font-size:12px; color:#bbb; margin-top:20px;">
          &copy; ${new Date().getFullYear()} Our App. All rights reserved.
        </p>
      </div>
    `;

    await sendEmail(user.email, "Reset Your Password 🔒", htmlContent);

    res.json({ success: true, message: "Reset link sent to email 📩" });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Forgot password error" });
  }
};



// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hash });

    // Send JSON message for frontend
 res.json({
  success: true,
  message: "Password reset successful ✅ Login Now",
  redirect: "/auth/login"
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

