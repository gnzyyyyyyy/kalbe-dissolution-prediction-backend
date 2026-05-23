const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const logActivity = require("../utils/logActivity");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

// REGISTER USER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let { role } = req.body;

        if (!username || !email || !password) {
            // Log activity
            await logActivity(
                "REGISTER_FAILED",
                `Register failed: missing credentials`,
                req.user
            );

            return res.status(400).json({ 
                message: "Please enter all fields" 
            });
        }

        if (!validator.isEmail(email)) {
            // Log activity
            await logActivity(
                "REGISTER_FAILED",
                `Register failed: invalid email`,
                req.user
            );

            return res.status(400).json({ 
                message: "Please enter a valid email" 
            });
        }

        if (!role) role = "nonActive";

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            // Log activity
            await logActivity(
                "REGISTER_FAILED",
                `Register failed: username '${username}' already exists`,
                req.user
            );

            return res.status(400).json({ 
                message: "User already exists" 
            });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            // Log activity
            await logActivity(
                "REGISTER_FAILED",
                `Register failed: email '${email}' already exists`,
                req.user
            );

            return res.status(400).json({ 
                message: "Email already exists" 
            });
        }

        // Role Limits
        if (role === "administrator") {
            const adminCount = await User.countDocuments({ role: "administrator" });
            if (adminCount >= 5) {
                // Log activity
                await logActivity(
                    "REGISTER_FAILED",
                    `Register failed: maximum number of administrators reached`,
                    req.user
                )

                return res.status(403).json({ 
                    message: "Maximum number of administrators reached" 
                });
            }
        }

        if (role === "operator") {
            const operatorCount = await User.countDocuments({ role: "operator" });
            if (operatorCount >= 15) {
                // Log activity
                await logActivity(
                    "REGISTER_FAILED",
                    `Register failed: maximum number of operators reached`,
                    req.user
                )

                return res.status(403).json({ 
                    message: "Maximum number of operators reached" 
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = "U-" + uuidv4().slice(0, 8);

        const user = await User.create({
            userId,
            username,
            email,
            password: hashedPassword,
            createdBy: req.user?.username || "system",
            role
        });

        await logActivity(
            "REGISTER_USER",
            `User ${user.username} registered successfully`,
            req.user
        );

        res.json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

// LOGIN USER
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // const username = req.body?.username;
        // const password = req.body?.password;

        if (!username || !password) {
            // Log activity
            await logActivity(
                "LOGIN_FAILED",
                `Login failed: missing credentials (username: ${username || "unknown"})`,
                null
            );

            return res.status(400).json({ 
                message: "Please enter all fields" 
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            // Log activity
            await logActivity(
                "LOGIN_FAILED",
                `Login failed: username '${username}' not found`,
                null
            );

            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        if (user.role === "nonActive") {
            // Log activity
            await logActivity(
                "LOGIN_FAILED",
                `Login failed: user '${username}' is inactive`,
                {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            );

            return res.status(403).json({ 
                message: "User is not active" 
            });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            // Log activity
            await logActivity(
                "LOGIN_FAILED",
                `Login failed: invalid password for '${username}'`,
                null
            );

            return res.status(401).json({ 
                message: "Invalid credentials" 
            });
        }

        const token = jwt.sign(
            {
                id:user._id,
                role:user.role,
                username:user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        await logActivity(
            "LOGIN_USER",
            `User ${user.username} logged in successfully`,
            {
                id:user._id,
                role:user.role,
                username:user.username
            }
        );

        res.json({
            message: "User logged in successfully",
            token
        });
    } catch (error) {
        console.log("LOGIN ERROR:", error);

        await logActivity(
            "LOGIN_FAILED",
            `Login failed: internal server error (username: ${req.body?.username || "unknown"})`,
            null
        );

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

// GET ALL ACTIVE USERS
exports.getActiveUser = async (req, res) => {
    try{
        // Take from frontend
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const query = {role: {
            $in: ["administrator", "operator"]
        }};

        // Pagination
        const skip = (page - 1) * limit;

        // Take total query
        const total = await User.countDocuments(query);

        const users = await User
            .find(query)
            .select("-password")
            .sort({createdAt: 1})
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            page,
            totalPage: Math.ceil(total / limit),
            totalData: total,
            users
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

// GET ALL NON-ACTIVE USERS
exports.getInactiveUser = async (req, res) => {
    try{
        // Take from frontend
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const query = {role: "nonActive"};

        // Pagination
        const skip = (page - 1) * limit;

        // Take total query
        const total = await User.countDocuments(query);

        const users = await User
            .find(query)
            .select("-password")
            .sort({createdAt: 1})
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            page,
            totalPage: Math.ceil(total / limit),
            totalData: total,
            users
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

// UPDATE ALL USERS
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;

        if (!username || !email || !role) {
            // Log activity
            await logActivity(
                "UPDATE_USER_FAILED",
                `Update user failed: missing fields`,
                req.user
            );

            return res.status(400).json({ 
                message: "All fields are required" 
            });
        }

        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            await logActivity(
                "UPDATE_USER_FAILED",
                `Update user failed: username already exists`,
                req.user
            );

            return res.status(400).json({
                message: "Username already exists"
            });
        }

        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== id) {
            // Log activity
            await logActivity(
                "UPDATE_USER_FAILED",
                `Update user failed: email already exists`,
                req.user
            );

            return res.status(400).json({ 
                message: "Email already exists" 
            });
        }

        const user = await User.findByIdAndUpdate(id, {
            username,
            email,
            role,
            updatedBy: req.user?.username || "system"
        }, {
            new: true
        });

        await logActivity(
            "UPDATE_USER",
            `User ${user.username} updated successfully`,
            req.user
        );

        res.json({
            message: "User updated successfully",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error"
        })
    }
}

// DELETE ALL USERS
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        await logActivity(
            "DELETE_USER",
            `User ${user.username} deleted successfully`,
            req.user
        );

        res.json({
            message: "User deleted successfully",
            user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal server error" 
        });
    }
}

// DEACTIVATE USER
exports.deactivateUser = async (req, res) => {
    try {
        const {id} = req.params

        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            // Log activity
            await logActivity(
                "DEACTIVATE_USER_FAILED",
                `Deactivate user failed: ID is not valid`,
                req.user
            )
            return res.status(400).json({
                message: "ID is not valid"
            })
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(
            id,
            {
                role: "nonActive",
                updatedBy: req.user?.username,
                updatedAt: Date.now(),
            },
            {new: true}
        )

        // Check the user
        if (!user) {
            // Log activity
            await logActivity(
                "DEACTIVATE_USER_FAILED",
                `Deactivate user failed: user not found`,
                req.user
            )
            return res.status(404).json({
                message: "User not found"
            })
        }

        await logActivity(
            "DEACTIVATE_USER",
            `User ${user.username} deactivated by ${req.user?.username}`,
            req.user
        )   

        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

// REACTIVATE USER
exports.reactivateUser = async (req, res) => {
    try {
        const {id} = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            // Log activity
            await logActivity(
                "REACTIVATE_USER_FAILED",
                `Reactivate user failed: ID is not valid`,
                req.user
            )

            return res.status(400).json({
                message: "ID is not valid"
            })
        }

        const user = await User.findByIdAndUpdate(
            id,
            {
                role: "operator",
                updatedBy: req.user?.username,
                updatedAt: Date.now(),
            },
            {new: true}
        )

        if (!user) {
            // Log activity
            await logActivity(
                "REACTIVATE_USER_FAILED",
                `Reactivate user failed: user not found`,
                req.user
            )

            return res.status(404).json({
                message: "User not found"
            })
        }

        await logActivity(
            "REACTIVATE_USER",
            `User ${user.username} reactivated by ${req.user?.username}`,
            req.user
        )   

        res.json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        })
    }
}

// Change password
exports.changePassword = async (req, res) => {
    try {
        // Take User ID
        const userId = req.user?.id

        // Check if the user exists
        const user = await User.findById(userId)
        if (!user) {
            // Log activity
            await logActivity(
                "CHANGE_PASSWORD_FAILED",
                `Change password failed: user not found`,
                req.user
            )

            return res.status(404).json({
                message: "User not found"
            })
        }

        // Take the new password
        const {password} = req.body

        if(!password) {
            // Log activity
            await logActivity(
                "CHANGE_PASSWORD_FAILED",
                `Change password failed: password is required`,
                req.user
            )

            return res.status(400).json({
                message: "Password is required"
            })
        }

        if(password.length < 8) {
            // Log activity
            await logActivity(
                "CHANGE_PASSWORD_FAILED",
                `Change password failed: password must be at least 8 characters`,
                req.user
            )

            return res.status(400).json({
                message: "Password must be at least 8 characters"
            })
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update the password
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword,
                updatedBy: req.user?.username,
                updatedAt: Date.now(),
            },
            {new: true}
        )

        await logActivity(
            "CHANGE_PASSWORD",
            `User ${user.username} changed password`,
            req.user
        );

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Fail to change password",
            error: error.message
        })
    }
}