process.env.JWT_SECRET = "testsecret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");

describe("MIDDLEWARE TEST", () => {

    it("should block request without token", async () => {

        const res = await request(app)
            .get("/api/users");

        expect(res.statusCode).toBe(401);

    });

    it("should block non-admin user", async () => {

        const token = jwt.sign(
            {
                role: "operator"
            },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(403);

    });

    it("should allow admin user", async () => {

        const token = jwt.sign(
            {
                role: "administrator"
            },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .get("/api/users")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).not.toBe(401);
        expect(res.statusCode).not.toBe(403);

    });

});