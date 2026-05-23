process.env.JWT_SECRET = "testsecret";

const mongoose = require("mongoose");
const {MongoMemoryServer} = require("mongodb-memory-server");

let mongo;

beforeAll(async () => {
    // connect to in-memory database
    mongo = await MongoMemoryServer.create();

    // get the mongo uri
    const uri = mongo.getUri();

    // connect to mongo
    await mongoose.connect(uri);
});

afterEach(async () => {
    // connect with mongo's collection
    const collections = mongoose.connection.collections;

    // delete all the collections
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

afterAll(async () => {
    // Drop database
    await mongoose.connection.dropDatabase();

    // Close connection
    await mongoose.connection.close();
    await mongo.stop();
});