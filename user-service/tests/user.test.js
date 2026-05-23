process.env.JWT_SECRET = "testsecret";

jest.mock("../src/utils/logActivity", () => {
    return jest.fn().mockResolvedValue(true);
});

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

jest.mock("../src/utils/logActivity", () => jest.fn());

describe("USER TEST", () => {

    let adminToken;

    beforeEach(() => {
        adminToken = jwt.sign(
            {
                id: "admin123",
                role: "administrator",
                username: "adminKalbe"
            },
            process.env.JWT_SECRET
        );
    });

    it("should register user", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send({
                username: "operator1",
                email: "operator@test.com",
                password: "123456",
                role: "operator"
            });
        
            expect(res.statusCode).toBe(200);

            expect(res.body.user.username).toBe("operator1");
    });

    it("should get all active users", async () => {
        await User.create({
            userId: "U004",
            username: "testUser",
            email: "test@test.com",
            password: "123456",
            role: "operator",
            createdBy: "system"
        });

        const res = await request(app)
            .get("/api/users/active")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
    });

    it("should get all inactive users", async () => {
        await User.create({
            userId: "U004",
            username: "testUser",
            email: "test@test.com",
            password: "123456",
            role: "nonActive",
            createdBy: "system"
        });

        const res = await request(app)
            .get("/api/users/inactive")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
    });
    
    it("should update user", async () => {
        const user = await User.create({
            userId: "U005",
            username: "beforeUpdate",
            email: "before@test.com",
            password: "123456",
            role: "operator",
            createdBy: "system"
        });

        const res = await request(app)
            .put(`/api/users/${user.id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                username: "afterUpdate"
            });

        expect(res.statusCode).toBe(200);

        const updatedUser = await User.findById(user.id);

        expect(updatedUser.username).toBe("afterUpdate");
    });

    it("should deactivate user", async () => {
        const user = await User.create({
            userId: "U006",
            username: "activeUser",
            email: "active@test.com",
            password: "123456",
            role: "operator",
            createdBy: "system"
        });

        const res = await request(app)
            .put(`/api/users/deactivate/${user.id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const updatedUser = await User.findById(user.id);

        expect(updatedUser.role).toBe("nonActive");
    });

    it("should activate user", async () => {
        const user = await User.create({
            userId: "U007",
            username: "inactiveUser",
            email: "inactive@test.com",
            password: "123456",
            role: "nonActive",
            createdBy: "system"
        });

        const res = await request(app)
            .put(`/api/users/reactivate/${user.id}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        const updatedUser = await User.findById(user.id);

        expect(updatedUser.role).toBe("operator");
    });

    it("should change the password", async () => {
        // create user
        const user = await User.create({
            userId: "U008",
            username: "passwordUser",
            email: "password@test.com",
            password: "123456",
            role: "operator",
            createdBy: "system"
        });

        // Sign JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                username: user.username
            },
            process.env.JWT_SECRET
        );

        // Change password
        const res = await request(app)
            .put(`/api/users/change-password`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                password: "newPassword"
            });

        expect(res.statusCode).toBe(200);

        const updatedUser = await User.findById(user._id);

        // Check password
        const isMatch = await bcrypt.compare("newPassword", updatedUser.password);

        expect(isMatch).toBe(true);
    });
});