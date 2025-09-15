const express = require("express");
const path = require('path')
const cron = require('node-cron');
const cors = require("cors");
const DBController = require("./db/mongoose");
const app = express();
const Util = require("./utils/util");
const CronController = require('./schedulers/CronController')
const fs = require("fs");
require("dotenv").config({ path: "./config/dev.env" });

app.use(cors());
app.use(
    express.urlencoded({ extended: true, limit: "5gb", parameterLimit: 50000 })
);
app.use(
    express.json({
        limit: "5gb",
    })
);
    app.use(require("./routes/AdminRoute"));
    app.use(require("./routes/UserRoute"))

app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); //to show image
app.use('/static_files', express.static(path.join(__dirname, '../static_files'))); //to show default static files

app.get("/", (req, res) => {
    // Require for Load Balancer - AWS
    res.sendStatus(200);
});
app.get("/robots.txt", function (req, res) {
    res.type("text/plain");
    res.send("User-agent: *\nDisallow: /");
});
app.get("/.well-known/pki-validation/6891BDA9E273B3979B64853D6A65F4BA.txt", (req, res) => {
    // Require for SSL
    const filePath = path.join(__dirname, '../static_files/ssl/6891BDA9E273B3979B64853D6A65F4BA.txt');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading the file.');
        }

        res.send(`<pre>${data}</pre>`);
    });

});
DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);
    httpServer.listen(process.env.PORT, async function () {
        console.log("Server is running on", Util.getBaseURL());

    });
});
