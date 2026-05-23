process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");

describe("AUTH MIDDLEWARE", () => {

    it("should reject request without token", async () => {

        const res = await request(app)
            .get("/api/datasets");

        expect(res.statusCode).toBe(401);

    });

    it("should allow valid token", async () => {

        const token = jwt.sign(
            {
                role: "administrator"
            },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .get("/api/datasets")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).not.toBe(401);

    });

});