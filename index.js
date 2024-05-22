import { createRequire } from "module";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { megaFunction } from "./server/mega.js";
import multer from 'multer';
const require = createRequire(import.meta.url);
const fs = require("fs");
const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const conf = JSON.parse(fs.readFileSync("./conf.json"));
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const conn = mysql.createConnection(conf);
const { Buffer } = require('buffer');
import {emailer} from "./email.js";
const jsonEmail = JSON.parse(fs.readFileSync("./mail.json"));
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Utilizza il middleware express.json() per analizzare le richieste JSON
app.use(express.json());


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/", express.static(path.join(__dirname, "public")));
const server = http.createServer(app);


app.post("/inviaEmailAdmin", async (req, res) => {
  const oggetto = req.body.oggetto;
  const testo = req.body.testo;
  await emailer.send(
    jsonEmail,
    "dellaquiladiego@itis-molinari.eu",
    oggetto,
    testo
  );
  res.json({ result: true });
});
app.post("/inviaEmailUtente", async (req, res) => {
  const destinatario = req.body.destinatario;
  const testo = req.body.testo;
  await emailer.send(
    jsonEmail,
    destinatario,
    "Copia mail inviata al concessionario",
    testo
  );
  res.json({ result: true });
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const sql = 'SELECT * FROM utenteTpsi WHERE username = ?';
  const [results] = await conn.promise().query(sql, [username]);
  if (results.length > 0) {
    const comparison = await bcrypt.compare(password, results[0].password);
    if (comparison) {
      // Controlla se l'utente è un admin
      if (results[0].admin) {
        res.json({ loginAdmin: true });
      } else {
        res.json({ loginUtente: true });
      }
    }
  } else {
    res.json({ loginUtente: false, loginAdmin: false });

  }
});



app.post("/registrazione", async function (req, res) {
  let requestData = req.body;
  let ruolo = requestData.admin;
  let sql = "SELECT * FROM utenteTpsi WHERE username = ?";
  try {
    const [risultati] = await conn.promise().query(sql, [requestData.username]);
    if (risultati.length) {
      res.json({
        ["registra" + ruolo]: false,
      });
    } else {
      bcrypt.hash(requestData.password, 10, async function (err, hash) {
        let query_insert =
          "INSERT INTO utenteTpsi (username, password, mail,admin) VALUES (?, ?, ?,?)";
        try {
          const [risultati] = await conn.promise().query(query_insert, [requestData.username, hash, requestData.mail, requestData.admin]);
          res.json({
            result: ["registra" + true]
          });
        } catch (errore) {
          res.json({
            result: ["registra" + false]
          });
        }
      });
    }
  } catch (errore) {
    throw errore;
  }
});

// Metodo per eliminare un'auto
app.delete("/deleteAuto", async (req, res) => {
  const requestBody = req.body;
  const sql = "DELETE FROM macchina  WHERE idMacchina = ?";
  try {
    const [result] = await conn.promise().query(sql, [requestBody.idMacchina]);
    res.json({ "result": true });
  } catch (err) {
    res.json({ "result": false });
  }
  conn.close();
});

// Metodo per eliminare un modello
app.delete("/deleteModello", async (req, res) => {
  const requestBody = req.body;
  const sql = "DELETE FROM modello  WHERE idModello = ?";
  try {
    const [result] = await conn.promise().query(sql, [requestBody.idModello]);
    res.json({ "result": true });
  } catch (err) {
    res.json({ "result": false });
  }
  conn.close();
});

// Metodo per eliminare una marca
app.delete("/deleteMarca", async (req, res) => {
  const requestBody = req.body;
  const sql = "DELETE FROM marca  WHERE idMarca = ?";

  try {
    const [result] = await conn.promise().query(sql, [requestBody.idMarca]);
    res.json({ "result": true });
  } catch (err) {
    res.json({ "result": false });
  }
  conn.close();
});

// Metodo per accettare le prelazioni
app.post("/rifiutaPrelazione", async (req, res) => {
  const id = req.body.id;
  try {
    const sql = 'UPDATE prelazione SET stato = "annullato" WHERE id = ?';
    const [result] = await conn.promise().query(sql, [id]);
    res.json({ result: true });
  } catch (err) {
    throw err;
  }
});






// Metodo per eliminare un utente
app.delete("/deleteUtente", async (req, res) => {
  const requestBody = req.body;
  const username = requestBody.username;

  const sql = 'DELETE FROM utente WHERE username = ?';
  try {
    const [result] = await conn.promise().query(sql, [username]);

    res.json({ "result": true });
  } catch (err) {
    res.json({ "result": false });
  }
  conn.close();
});



// Metodo per creare una nuova prelazione
app.post('/postPrelazione', async (req, res) => {
  let idUtente = req.body.idUtente;
  let stato = "attesa";
  let idMacchina = req.body.idMacchina;
  let oggi = new Date();
  let giorno = oggi.getDate();
  let mese = oggi.getMonth() + 1;
  let anno = oggi.getFullYear();
  const data = anno + '-' + mese + '-' + giorno; const sql = 'INSERT INTO prelazione(idUtente,idMacchina,data,stato) VALUES(?,?,?,?);';
  try {
    const [result] = await conn.promise().query(sql, [idUtente, idMacchina, data, stato]);
    res.send({ "result": true });
  } catch (err) {
    res.send({ "result": false });
  }
});

// Metodo per aggiungere ai preferiti
app.post('/postPreferiti', async (req, res) => {
  let idMacchina = req.body.idMacchina;
  let idUtente = req.body.idUtente;
  try {
    const sql = 'INSERT INTO preferiti(idUtente,idMacchina) VALUES(?,?);';

    const [result] = await conn.promise().query(sql, [idUtente, idMacchina]);
    console.log(result);

    res.send({ "result": true });
  } catch (err) {
    res.send({ "result": false });
  }
});


// Metodo per creare un nuovo modello
app.post('/postModello', async (req, res) => {
  let nome = req.body.nome;
  let idMarca = req.body.idMarca;
  let sql = `INSERT INTO modello(nome,idMarca) VALUES(?,?);`;
  try {
    const [result] = await conn.promise().query(sql, [nome, idMarca]);
    res.send({ "result": true });
  } catch (err) {
    res.send({ "result": false });
  }
});

// Metodo per creare una nuova marca
app.post('/postMarca', async (req, res) => {
  let nome = req.body.nome;
  let sql = `INSERT INTO marca(nome) VALUES(?);`;
  try {
    const [result] = await conn.promise().query(sql, [nome]);
    res.send({ "result": true });
  } catch (err) {
    res.send({ "result": false });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // limita la dimensione del file a 5MB
  },
  allowUploadBuffering: true, // abilita il buffering del file
});

// Metodo per creare una nuova auto
app.post('/postAuto', upload.single('file'), async (req, res) => {
  // Leggi il corpo della richiesta
  let requestData = req.body;
  // Preparazione della query SQL
  let carburante = requestData.carburante;
  let descrizione = requestData.descrizione;
  let condizione = requestData.condizione;
  let cambio = requestData.cambio;
  let allestimento = requestData.allestimento;
  let anno = requestData.anno;
  let disponibilita = requestData.disponibilita;
  let km = requestData.km;
  let prezzo = requestData.prezzo;
  let idModello = requestData.idModello;
  let file = req.body.file; // Accedi al file caricato

  // Esecuzione della query
  try {
    let sql = "INSERT INTO macchina(carburante,descrizione,condizione,cambio,allestimento,anno,disponibilità,KM,prezzo,idModello) VALUES(?,?,?,?,?,?,?,?,?,?)";
    const [result] = await conn.promise().query(sql, [carburante, descrizione, condizione, cambio, allestimento, anno, disponibilita, km, prezzo, idModello]);
    // Successo: l'esecuzione è andata a buon fine
    let sql2 = "SELECT idMacchina FROM macchina ORDER BY idMacchina DESC LIMIT 1";
    const [result2] = await conn.promise().query(sql2);
    const idMacchina = result2.idMacchina;
    console.log(file);
    const fileName = path.basename(file.originalname); // Estrai solo il nome del file
    const link = await megaFunction.uploadFileToStorage(fileName, file.buffer); // Carica il file su Mega
    console.log("link:"+link);
    let sql3 = "INSERT INTO immaginiTpsi(path, idMacchina) VALUES(?, ?)";
    const [risultati] = await conn.promise().query(sql3, [link, idMacchina]);
    res.status(200).json({ "Result": fileName, "link": link }); // Restituisci solo il nome del file e il link
    res.send({ "result": true });
  } catch (err) {
    // Errore durante l'esecuzione
    res.send({ "result": false, message: err.message});
  }
  // Chiusura della connessione
  conn.close();
});




// Metodo per ottenere le marche
app.get("/marca", async (req, res) => {
  try {
    const [result] = await conn.promise().query("SELECT * FROM marca");
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere i modelli
app.get("/modello", async (req, res) => {
  try {
    const [result] = await conn.promise().query(
      "SELECT model.*, mar.nome AS marca FROM modello model JOIN marca mar ON model.idMarca = mar.idMarca "
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le transazioni
app.get("/getPrelazioniAdmin", async (req, res) => {
  try {
    const [result] = await conn.promise().query("SELECT prelazione.id, prelazione.data, utente.username, modello.nome AS modello, marca.nome AS marca FROM prelazione JOIN utente ON prelazione.idUtente = utente.username  JOIN macchina ON prelazione.idMacchina = macchina.idMacchina  JOIN modello ON macchina.idModello = modello.idModello  JOIN marca ON modello.idMarca = marca.idMarca WHERE prelazione.stato = 'attesa'");
    res.json({ result });
  } catch (err) {
    throw err;
  }
});
// Metodo per ottenere le transazioni
app.post("/getPrelazioni", async (req, res) => {
  const idUtente = req.body.idUtente;
  try {
    const [result] = await conn.promise().query("SELECT prelazione.id, prelazione.data,prelazione.stato,utente.username, modello.nome AS modello, marca.nome AS marca FROM prelazione JOIN utente ON prelazione.idUtente = utente.username  JOIN macchina ON prelazione.idMacchina = macchina.idMacchina  JOIN modello ON macchina.idModello = modello.idModello  JOIN marca ON modello.idMarca = marca.idMarca WHERE prelazione.idUtente = ?", [idUtente]);
    res.json({ result });
  } catch (err) {
    throw err;
  }
});
// Metodo per ottenere le auto preferite
app.post("/preferiti", async (req, res) => {
  const username = req.body.username;
  try {
    const sql = 'SELECT mac.idMacchina, mac.carburante, mac.descrizione, mac.condizione, mac.cambio, mac.allestimento, mac.anno, mac.disponibilità, mac.KM, mac.prezzo, mac.idModello, mar.nome AS nomeMarca, modelloM.nome AS nomeModello   FROM preferiti pref  JOIN macchina mac ON pref.idMacchina = mac.idMacchina JOIN modello modelloM ON mac.idModello = modelloM.idModello  JOIN marca mar ON modelloM.idMarca = mar.idMarca   WHERE pref.idUtente = ?';
    const [result] = await conn.promise().query(sql, [username])
    console.log("result prefe: " + JSON.stringify(result, null, 2));
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere un utente
app.post("/utente", async (req, res) => {
  const username = req.body.username;
  try {
    const sql = "SELECT * FROM utenteTpsi WHERE username = ?";
    const [result] = await conn.promise().query(sql, [username])
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per accettare le prelazioni
app.post("/accettaPrela", async (req, res) => {
  const id = req.body.id;
  try {
    const sql = 'UPDATE prelazione SET stato = "evaso" WHERE id = ?';
    const [result] = await conn.promise().query(sql, [id]);
    const sql2 = "UPDATE macchina SET disponibilità = disponibilità - 1 WHERE idMacchina = (SELECT idMacchina FROM prelazione WHERE id = ?)";
    const [result2] = await conn.promise().query(sql2, [id]);
    const sql3 = "SELECT disponibilità FROM macchina WHERE idMacchina = (SELECT idMacchina FROM prelazione WHERE id = ?)";
    const [result3] = await conn.promise().query(sql3, [id]);
    if (result3.disponibilità === null) {
      const sql4 = "DELETE FROM macchina WHERE idMacchina = (SELECT idMacchina FROM prelazione WHERE id = ?)";
      const [result4] = await conn.promise().query(sql4, [id]);
    }
    res.json({ result: true });
  } catch (err) {
    throw err;
  }
});



// Metodo per eliminare un preferito
app.delete("/deletePreferiti", async (req, res) => {
  const requestBody = req.body;
  const sql = 'DELETE FROM preferiti WHERE idMacchina = ? AND idUtente = ?';
  try {
    const [result] = await conn.promise().query(sql, [requestBody.idMacchina, requestBody.idUtente]);
    res.json({ "result": true });
  } catch (err) {
    res.json({ "result": false });
  }
  conn.close();
});

// Funzione per convertire uno stream in un buffer
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
async function convertStreamToBase64(stream) {
  const buffer = await streamToBuffer(stream);
  return buffer.toString('base64');
}


// Metodo per ottenere le macchine
app.get("/macchina", async (req, res) => {
  try {
    const result = await conn.promise().query("SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca ");
    let data = [];
    for (let row of result[0]) {
      const sql = "SELECT path FROM immaginiTpsi WHERE idMacchina = ?";
      const [resultImg] = await conn.promise().query(sql, [row.idMacchina]);
      const link = resultImg.path;
      const { stream, fileName } = await megaFunction.downloadFileFromLink(link); // Scarica il file da Mega
      // Utilizza la funzione per convertire lo stream
      const base64String = await convertStreamToBase64(stream);
      row.immagini = base64String;
      data.push(row);
    }
    res.json({ "result": data });
  } catch (err) {
    throw err;
  }
});


// Metodo per ottenere le auto nuove
app.get("/autonuove", async (req, res) => {
  try {
    const result = await conn.promise().query("SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca WHERE mac.condizione = 'Nuovo'"
    );
    let data = [];
    for (let row of result[0]) {
      const sql = "SELECT path FROM immaginiTpsi WHERE idMacchina = ?";
      const [resultImg] = await conn.promise().query(sql, [row.idMacchina]);
      const link = resultImg.path;
      const { stream, fileName } = await megaFunction.downloadFileFromLink(link); // Scarica il file da Mega
      // Utilizza la funzione per convertire lo stream
      const base64String = await convertStreamToBase64(stream);
      row.immagini = base64String;
      data.push(row);
    }
    res.json({ "result": data });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le auto usate
app.get("/autousate", async (req, res) => {
  try {
    const result = await conn.promise().query("SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca WHERE mac.condizione = 'Usato'"
    );
    let data = [];
    for (let row of result[0]) {
      const sql = "SELECT path FROM immaginiTpsi WHERE idMacchina = ?";
      const [resultImg] = await conn.promise().query(sql, [row.idMacchina]);
      const link = resultImg.path;
      const { stream, fileName } = await megaFunction.downloadFileFromLink(link); // Scarica il file da Mega
      // Utilizza la funzione per convertire lo stream
      const base64String = await convertStreamToBase64(stream);
      row.immagini = base64String;
      data.push(row);
    }
    res.json({ "result": data });
  } catch (err) {
    throw err;
  }
});

server.listen(3001, () => {
  console.log("- server running on port 3001");
});
