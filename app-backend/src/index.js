

const express = require("express");
const app = express();
const router = require("./routes/routes");
const log4js = require("log4js");
const logger = log4js.getLogger();
const data = require("../config/db-credentials");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    
    res.header("Access-Control-Allow-Headers", "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept");
    
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    } else {
        next();
    }
});


app.use(router);

if (process.env.NODE_ENV === "production") {
	logger.level = "trace";
	logger.trace(`= = = = = = PROJECT IN PRODUCTION = = = = = =`);
} else {
	logger.level = "trace";
	logger.trace(`= = = = = = PROJECT IN DEVELOPMENT = = = = = =`);
}

app.listen(data.port, '0.0.0.0', () => {
    logger.level = "info";
    logger.info(`App listening at http://0.0.0.0:${data.port}`);
});