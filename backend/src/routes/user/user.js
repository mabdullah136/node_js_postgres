const express = require("express");
const userController = require("../../controllers/user/user");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/refresh", userController.refresh);

module.exports = router;
