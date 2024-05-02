const fs = require("fs");
const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const conf = JSON.parse(fs.readFileSync("./conf.json"));
const crypto = require("crypto");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const conn = mysql.createConnection(conf);
const server = http.createServer(app);
const io = new Server(server);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/", express.static(path.join(__dirname, "public")));
server.listen("3001", () => {
  console.log("server running on port: 3001");
});

app.post("/login", async (req, res) => {
  const { username, password, ruolo } = req.body;

  if (ruolo === "admin") {
    conn.query(
      "SELECT * FROM admin WHERE username = ?",
      [username],
      async (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
          const comparison = await bcrypt.compare(password, results[0].pass);

          if (comparison) {
            const token = crypto.randomBytes(30).toString("hex");
            req.session.token = token;
            req.session.token_expire = Date.now() + 3600000;
            res.json({ loginAdmin: true, token });
          } else {
            res.json({ loginAdmin: false });
          }
        } else {
          res.json({ loginAdmin: false });
        }
      },
    );
  } else if (ruolo === "utente") {
    conn.query(
      "SELECT * FROM utente WHERE username = ?",
      [username],
      async (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
          const comparison = await bcrypt.compare(password, results[0].pass);

          if (comparison) {
            const token = crypto.randomBytes(30).toString("hex");
            req.session.token = token;
            req.session.token_expire = Date.now() + 3600000;
            res.json({ loginUtente: true, token });
          } else {
            res.json({ loginUtente: false });
          }
        } else {
          res.json({ loginUtente: false });
        }
      },
    );
  }
});
