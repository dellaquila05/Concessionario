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
const emailer = require('./email');
const jsonEmail = JSON.parse(fs.readFileSync("./mail.json"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/", express.static(path.join(__dirname, "public")));
const server = http.createServer(app);

function salvaImg(req) {
  // Controlla se i file sono stati caricati
  if (req.files && req.files.image) {
    const files = req.files.image;
    const file_path = [];
    for (let i = 0; i < files.name.length; i++) {
      const file_name = files.name[i];
      const file_tmp = files.tmp_name[i];
      const file_ext = path.extname(file_name).toLowerCase();

      // Genera un nome di file univoco
      const unique_file_name = `${Date.now()}_${Math.floor(Math.random() * 1000)}${file_ext}`;

      // Definisci la nuova posizione del file
      const new_location = path.join(__dirname, '..', 'immagini', 'uploads', unique_file_name);

      // Sposta il file caricato alla nuova posizione
      fs.renameSync(file_tmp, new_location);

      // Salva il percorso del file in una variabile
      file_path.push(new_location);
    }
    return file_path;
  } else {
    return [];
  }
}

app.post("/inviaEmailAdmin", async (req, res) =>{
  const oggetto = req.body.oggetto;
  const testo = req.body.testo;
  await emailer.send(
    jsonEmail,
    "dellaquiladiego@itis-molinari.eu",
    oggetto,
    testo  
  );
  res.json({result: true});
});
app.post("/inviaEmailUtente", async (req, res) =>{
  const destinatario = req.body.destinatario;
  const testo = req.body.testo;
  await emailer.send(
    jsonEmail,
    destinatario,
    "Copia mail inviata al concessionario",
    testo
  );
  res.json({result: true});
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

app.post('/upload', async (req, res) => {
  const requestBody = req.body;
  const idMacchina = requestBody.idMacchina;
  const imgSaved = salvaImg(req);
  for (let i = 0; i < imgSaved.length; i++) {
    const path = imgSaved[i];
    let sql = "INSERT INTO immagine(path, idMacchina) VALUES(?, ?)";
    try {
      const [risultati] = await conn.promise().query(sql, [path, idMacchina]);
      res.json({ "result": true });
    } catch (err) {
      res.json({ "result": false });
    }
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


// Metodo per eliminare un'immagine
app.delete("/deleteImmagini", async (req, res) => {
  const requestBody = req.body;
  const sql = 'DELETE FROM immagine WHERE idMacchina = ? AND idImmagine = ?';
  try {
    const [result] = await conn.promise().query(sql, [requestBody.idMacchina, requestBody.idImmagine]);
    res.json({ "result": true });
  } catch (err) {
    res.json({ "result": false });
  }
  conn.close();
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


////
// Funzione per ottenere l'immagine in base64
function getBase64Image(path) {
  if (fs.existsSync(path)) {
    const imageData = fs.readFileSync(path);
    return Buffer.from(imageData).toString("base64");
  }
  return null;
}

// Metodo per creare una nuova prelazione
app.post('/postPrelazione', async (req, res) => {
  let idUtente = req.body.idUtente;
  let stato = "attesa";
  let idMacchina = req.body.idMacchina;
  let oggi = new Date();
let giorno = oggi.getDate();
let mese = oggi.getMonth() + 1; 
let anno = oggi.getFullYear();
const data = anno + '-' + mese + '-' + giorno;  const sql = 'INSERT INTO prelazione(idUtente,idMacchina,data,stato) VALUES(?,?,?,?);';
  try {
    const [result] = await conn.promise().query(sql, [idUtente, idMacchina, data , stato ]);
    res.send({ "result": true });
  } catch (err) {
    res.send({ "result": false });
  }
});

// Metodo per aggiungere ai preferiti
app.post('/postPreferiti', async (req, res) => {
  let idMacchina = req.body.idMacchina;
  let idUtente = req.body.idUtente;
  const sql = 'INSERT INTO preferiti(idUtente,idMacchina) VALUES(?,?);`';
  try {
    
      const [result] = await conn.promise().query(sql, [idUtente, idMacchina]);

    
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

// Metodo per creare una nuova auto
app.post('/postAuto', async (req, res) => {
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
  let sql = "INSERT INTO macchina(carburante,descrizione,condizione,cambio,allestimento,anno,disponibilità,KM,prezzo,idModello) VALUES(?,?,?,?,?,?,?,?,?,?)";
  // Esecuzione della query
  try {
    const [result] = await conn.promise().query(sql, [carburante, descrizione, condizione, cambio, allestimento, anno, disponibilita, km, prezzo, idModello]);
    // Successo: l'esecuzione è andata a buon fine
    let sql2 ="SELECT idMacchina FROM macchina ORDER BY mac.idMacchina DESC LIMIT 1" ;
    const [result2] = await conn.promise().query(sql2);
    let idMacchina = result2;
    // Process images
    let images = requestData.images;
    for (let image of images) {
      // Generate a unique filename
      let filename = uniqid() + '.png';
      // Save the image to the filesystem
      fs.writeFileSync('immaginiAuto/' + filename, Buffer.from(image, 'base64'));
      // Insert the image path into the database
      let sql = "INSERT INTO immagine(path, idMacchina) VALUES(?, ?)";
      const [result] = await conn.promise().query(sql, [filename, idMacchina]);
    }
    res.send({ "result": true });
  } catch (err) {
    // Errore durante l'esecuzione
    res.send({ "result": false, message: "Failed to execute the SQL statement" });
  }
  // Chiusura della connessione
  conn.close();
});


// Metodo per ottenere un'immagine
app.post("/immagine", async (req, res) => {
  const idMacchina = req.body.idMacchina;
  try {
    const sql =
      "SELECT * FROM immagine WHERE idMacchina = ?";
    const [result] = await conn.promise().query(sql, [idMacchina]);
    if (result.length > 0) {
      const path = result[0].path;
      const base64Image = getBase64Image(path);
      res.json({ "result": base64Image });
    } else {
      res.json({ "result": null });
    }
  } catch (err) {
    throw err;
  }
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
    const [result] = await conn.promise().query("SELECT prelazione.id, prelazione.data, utente.username, modello.nome AS modello, marca.nome AS marca FROM prelazione JOIN utente ON prelazione.idUtente = utente.username  JOIN macchina ON prelazione.idMacchina = macchina.idMacchina  JOIN modello ON macchina.idModello = modello.idModello  JOIN marca ON modello.idMarca = marca.idMarca WHERE prelazione.stato = 'attesa'"    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});
// Metodo per ottenere le transazioni
app.post("/getPrelazioni", async (req, res) => {
  const idUtente= req.body.idUtente;
  try {
    const [result] = await conn.promise().query("SELECT prelazione.id, prelazione.data,prelazione.stato,utente.username, modello.nome AS modello, marca.nome AS marca FROM prelazione JOIN utente ON prelazione.idUtente = utente.username  JOIN macchina ON prelazione.idMacchina = macchina.idMacchina  JOIN modello ON macchina.idModello = modello.idModello  JOIN marca ON modello.idMarca = marca.idMarca WHERE prelazione.idUtente = ?",[idUtente]    );
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
    console.log("result prefe: " + result);
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

// Metodo per ottenere le macchine
app.get("/macchina", async (req, res) => {
  try {
    const result = await conn.promise().query("SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca ");
    let data = [];
    for (let row of result[0]) {
      const sql = "SELECT * FROM immagine WHERE idMacchina = ?";
      const [resultImg] = await conn.promise().query(sql, [row.idMacchina]);
      let arrayImg = [];
      for (let rowImg of resultImg) {
        let path = rowImg.path;
        let base64Image = getBase64Image(path);
        arrayImg.push(base64Image);
      }
      row.immagini = arrayImg;
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
      const sql = "SELECT * FROM immagine WHERE idMacchina = ?";
      const [resultImg] = await conn.promise().query(sql, [row.idMacchina]);
      let arrayImg = [];
      for (let rowImg of resultImg) {
        let path = rowImg.path;
        let base64Image = getBase64Image(path);
        arrayImg.push(base64Image);
      }
      row.immagini = arrayImg;
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
      const sql = "SELECT * FROM immagine WHERE idMacchina = ?";
      const [resultImg] = await conn.promise().query(sql, [row.idMacchina]);
      let arrayImg = [];
      for (let rowImg of resultImg) {
        let path = rowImg.path;
        let base64Image = getBase64Image(path);
        arrayImg.push(base64Image);
      }
      row.immagini = arrayImg;
      data.push(row);
    }
    res.json({ "result": data });
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
    if(result3.disponibilità === null) {
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



server.listen(3001, () => {
  console.log("- server running on port 3001");
});
