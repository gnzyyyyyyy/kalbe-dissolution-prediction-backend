process.env.JWT_SECRET = "testsecret";

jest.mock("../src/utils/logActivity", () => jest.fn());

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const bcrypt = require("bcryptjs");

describe("AUTH TEST", () => {
    it("should login successfully", async () => {
        const hashedPassword = await bcrypt.hash("kalbe123", 10);

        await User.create({
            userId: "U001",
            username: "adminKalbe",
            email: "admin@test.com",
            password: hashedPassword,
            role: "administrator",
            createdBy: "system"
        });

        const res = await request(app)
            .post("/api/users/login")
            .set("Content-Type", "application/json")
            .send({
                username: "adminKalbe",
                password: "kalbe123"
            });

        console.log(res.body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    it("should fail if password is wrong", async () => {
        const hashedPassword = await bcrypt.hash("kalbe123", 10);

        await User.create({
            userId: "U001",
            username: "adminKalbe",
            email: "admin@test.com",
            password: hashedPassword,
            role: "administrator",
            createdBy: "system"
        });

        const res = await request(app)
            .post("/api/users/login")
            .set("Content-Type", "application/json")
            .send({
                username: "adminKalbe",
                password: "wrongPassword"
            });

        expect(res.statusCode).toBe(401);
    });

    it("should fail if user not found", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .set("Content-Type", "application/json")
            .send({
                username: "wrongUsername",
                password: "wrongPassword"
            });

        expect(res.statusCode).toBe(404);
    });

    it("should fail if user is inactive", async () => {
        const hashedPassword = await bcrypt.hash("kalbe123", 10);

        await User.create({
            userId: "U001",
            username: "adminKalbe",
            email: "admin@test.com",
            password: hashedPassword,
            role: "nonActive",
            createdBy: "system"
        });

        const res = await request(app)
            .post("/api/users/login")
            .set("Content-Type", "application/json")
            .send({
                username: "adminKalbe",
                password: "kalbe123"
            });

        expect(res.statusCode).toBe(403);
    });
});