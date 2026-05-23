jest.mock("../src/utils/logActivity", () => {
    return jest.fn().mockResolvedValue(true);
});

const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

describe("AUTH MIDDLEWARE", () => {
    it("should reject request without token", async () => {
        const res = await request(app)
            .get("/api/logs/");

        expect(res.statusCode).toBe(401);
    });

    it("should reject non admin user", async () => {
        const token = jwt.sign(
            {
                role: "operator"
            },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .get("/api/logs/")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });
});