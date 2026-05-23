require("dotenv").config();

console.log("LOG_SERVICE_URL:", process.env.LOG_SERVICE_URL);

const app = require("./app");
const connectDB = require("./config/db");

const User = require("./models/User");
const bcrypt = require("bcryptjs");

const PORT = process.env.PORT || 3001;

async function seedAdmin() {
    try {

        const admin = await User.findOne({
            role: "administrator"
        });

        if (!admin) {

            const password = await bcrypt.hash("kalbe123", 10);

            await User.create({
                userId: "U001",
                username: "adminKalbe",
                password,
                role: "administrator",
                createdBy: "system"
            });

            console.log("Admin created");
        } else {
            console.log("Admin already exists");
        }

    } catch (error) {
        console.log("SEED ERROR:", error);
    }
}

async function startServer() {
    try {

        await connectDB();

        await seedAdmin();

        app.listen(PORT, () => {
            console.log(`User Service running on port ${PORT}`);
        });

    } catch (error) {
        console.log("SERVER ERROR:", error);
    }
}

startServer();