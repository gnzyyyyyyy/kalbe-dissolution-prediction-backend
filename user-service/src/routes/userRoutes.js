const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// PUBLIC
router.post("/login", userController.login);

router.put("/change-password", verifyToken, userController.changePassword);

// ADMIN ONLY
router.post("/register", userController.register);

router.get("/active", verifyToken, isAdmin, userController.getActiveUser);

router.get("/inactive", verifyToken, isAdmin, userController.getInactiveUser);

router.delete("/:id", verifyToken, isAdmin, userController.deleteUser);

router.put("/deactivate/:id", verifyToken, isAdmin, userController.deactivateUser);

router.put("/reactivate/:id", verifyToken, isAdmin, userController.reactivateUser);

router.put("/:id", verifyToken, isAdmin, userController.updateUser);

module.exports = router;