process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const ActivityLog = require("../src/models/ActivityLog");

describe("LOG TEST", () => {

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

    it("should create activity log", async () => {
        const res = await request(app)
            .post("/api/logs")
            .send({
                action: "LOGIN_USER",
                description: "User logged in",
                doneBy: "adminKalbe",
                role: "administrator"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.action).toBe("LOGIN_USER");
    });

    it("should get all logs", async () => {
        await ActivityLog.create({
            action: "TEST_ACTION",
            description: "TEST AJA",
            doneBy: "adminKalbe",
            role: "administrator"
        });

        const res = await request(app)
            .get("/api/logs")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
    });

    it("should filter logs by role", async () => {
        await ActivityLog.create({
            action: "ADMIN_ACTION",
            description: "ADMIN AJA",
            doneBy: "adminKalbe",
            role: "administrator"
        });

        await ActivityLog.create({
            action: "USER_ACTION",
            description: "USER AJA",
            doneBy: "operator1",
            role: "operator"
        });

        const res = await request(app)
            .get("/api/logs?role=administrator")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
    });

    it("should filter logs by username", async () => {
        await ActivityLog.create({
            action: "LOGIN",
            description: "ADMIN AJA",
            doneBy: "adminKalbe",
            role: "administrator"
        });

        const res = await request(app)
            .get("/api/logs?doneBy=adminKalbe")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
    });
});