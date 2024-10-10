const PORT = 3001;

const express = require("express");
const app = express();
const router = require("./routes/routes");
const log4js = require("log4js");
const logger = log4js.getLogger();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
	  "Access-Control-Allow-Headers",
	  "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Content-Length, Content-Disposition, Accept, Access-Control-Allow-Request-Method"
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
	res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  
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

app.listen(PORT, '0.0.0.0', () => {
    logger.level = "info";
    logger.info(`App listening at http://0.0.0.0:${PORT}`);
});