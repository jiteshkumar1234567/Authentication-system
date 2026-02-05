require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const routes = require("./routes/authRoutes");
const passport = require("./config/passport");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
db();

// parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// passport
app.use(passport.initialize());

// routes
app.use("/auth", routes);

// home
app.get("/", (req, res) => {
  res.redirect("/auth/login");
});

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);
