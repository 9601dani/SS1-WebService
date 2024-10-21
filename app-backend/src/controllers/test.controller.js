const getConnection = require("../../db/db.js");


const testController = {}

testController.testDB = async (req, res) => {
    try {
        const connection = await getConnection();
        connection.release();
        res.send("Connection to database was successful.");
    } catch (error) {
        res.status(500).send("Connection to database failed.");
    }
}

testController.helloWorld = (req, res) => {
    res.send("Hello World! This is a Module Credit CARD API. 201930699 #3");
}

module.exports = testController;