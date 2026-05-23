process.env.JWT_SECRET = "testsecret";

jest.mock("../src/utils/logActivity", () => {
    return jest.fn().mockResolvedValue(true);
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = require("../src/app");
const Dataset = require("../src/models/Dataset");

describe("DATASET TEST", () => {

    let token;

    beforeEach(() => {
        token = jwt.sign(
            {
                id: "user123",
                role: "administrator",
                username: "adminKalbe"
            },
            process.env.JWT_SECRET
        );
    });

    it("should upload dataset successfully", async () => {

        const res = await request(app)
            .post("/api/datasets/upload")
            .set("Authorization", `Bearer ${token}`)
            .attach(
                "dataset",
                path.join(__dirname, "sample.xls")
            );

        expect(res.statusCode).toBe(201);

        expect(res.body.dataset).toHaveProperty("fileName");

    });

    it("should get all datasets", async () => {

        await Dataset.create({
            fileName: "test.csv",
            originalName: "test.csv",
            filePath: "/uploads/test.csv",
            fileSize: 100,
            rowCount: 2,
            uploadedBy: "user123",
            uploadedByUsername: "user123"
        });

        const res = await request(app)
            .get("/api/datasets")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.datasets.length).toBe(1);

    });

    it("should get dataset by id", async () => {

        const dataset = await Dataset.create({
            fileName: "test.csv",
            originalName: "test.csv",
            filePath: "/uploads/test.csv",
            fileSize: 100,
            rowCount: 2,
            uploadedBy: "user123",
            uploadedByUsername: "user123"
        });

        const res = await request(app)
            .get(`/api/datasets/${dataset._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        expect(res.body.originalName).toBe("test.csv");

    });

    it("should update dataset", async () => {

        const dataset = await Dataset.create({
            fileName: "before.csv",
            originalName: "before.csv",
            filePath: "/uploads/before.csv",
            fileSize: 100,
            rowCount: 2,
            uploadedBy: "user123",
            uploadedByUsername: "user123"
        });

        const res = await request(app)
            .put(`/api/datasets/${dataset._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                originalName: "after.csv"
            });

        expect(res.statusCode).toBe(200);

    });

    it("should archive dataset", async () => {

        const dataset = await Dataset.create({
            fileName: "archive.csv",
            originalName: "archive.csv",
            filePath: "/uploads/archive.csv",
            fileSize: 100,
            rowCount: 2,
            uploadedBy: "user123",
            uploadedByUsername: "user123"
        });

        const res = await request(app)
            .put(`/api/datasets/archive/${dataset._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        const updated = await Dataset.findById(dataset._id);

        expect(updated.statusDataset).toBe("Archived");

    });

    it("should activate dataset", async () => {
        const dataset = await Dataset.create({
            fileName: "archive.csv",
            originalName: "archive.csv",
            filePath: "/uploads/archive.csv",
            fileSize: 100,
            rowCount: 2,
            uploadedBy: "user123",
            uploadedByUsername: "user123"
        });

        const res = await request(app)
            .put(`/api/datasets/activate/${dataset._id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);

        const updated = await Dataset.findById(dataset._id);

        expect(updated.statusDataset).toBe("Active");
    });
});