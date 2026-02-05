const router = require("express").Router();
const ctrl = require("../controllers/authController");
const passport = require("passport");
const protect = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

/* ===== VIEW ROUTES ===== */
router.get("/signup", (req, res) => res.render("signup"));
router.get("/login", (req, res) => res.render("login"));
router.get("/forgot", (req, res) => res.render("forgot"));

router.get("/dashboard", protect, (req, res) => {
  res.render("dashboard");
});

router.get("/reset/:id", (req, res) => {
  res.render("reset", { id: req.params.id });
});

/* ===== AUTH API ===== */
router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.get("/verify/:id", ctrl.verifyEmail);
router.post("/forgot", ctrl.forgotPassword);
router.post("/reset/:id", ctrl.resetPassword);

/* ===== LOGOUT ===== */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

/* ===== GOOGLE AUTH ===== */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    // 🔥 req.user passport se milta hai
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET
    );

    // 🔥 COOKIE SET (MOST IMPORTANT)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });

    res.redirect("/auth/dashboard");
  }
);

module.exports = router;
