const { generate: uniqueId } = require("shortid");
const bcrypt = require("bcryptjs");
const User = require("../../models/user/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide username, email, password.",
    });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "The password must be at least 8 characters long.",
      });
    }

    const salt = uniqueId();
    const passwordHash = bcrypt.hashSync(salt + password, 10);

    const newUser = await User.create({
      username,
      email,
      password: passwordHash,
      salt,
    });

    return res.status(201).json({
      success: true,
      message: "User signed up successfully.",
      date: newUser,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during signup.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, password.",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.validPassword(user.salt, password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid password.",
      });
    }
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: user.email,
          id: user._id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15d" }
    );
    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "20d" }
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      date: {
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
        },
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
};

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
});

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: user.id,
          email: user.email,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15d" }
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        accessToken: accessToken,
      },
    });
  } catch (err) {
    console.error("Error verifying refresh token:", err);
    return res.status(403).json({ message: "Forbidden" });
  }
});

module.exports = { signup, login, logout, refresh };
