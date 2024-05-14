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

//const io = new Server(server);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use("/", express.static(path.join(__dirname, "public")));

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


app.post("/login", async (req, res) => {
  const  username   = req.body.username ;
  const  password  = req.body.password;
    conn.query(
      "SELECT * FROM utenteTpsi WHERE username = ?",
      [username],
      async (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
          const comparison = await bcrypt.compare(password, results[0].pass);

          if (comparison) {
            // Controlla se l'utente è un admin
            if (results[0].admin) {
              res.json({ loginAdmin: true });
            } else {
              res.json({ loginUtente: true });
            }
          }
        } else {
          res.json({ loginUtente: false , loginAdmin : false});
        }
      },
    );
  
});


// Metodo per eliminare un admin
app.delete("/deleteAdmin", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM admin WHERE username = ?");
  stmt.bind_param("s", requestBody.username);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare una promozione
app.delete("/deletePromo", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM sconto WHERE idSconto = ?");
  stmt.bind_param("s", requestBody.idSconto);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

app.post('/upload', async (req, res) => {
  const requestBody = req.body;
  const idMacchina = requestBody.idMacchina;
  const imgSaved = salvaImg(req);
  for (let i = 0; i < imgSaved.length; i++) {
    const path = imgSaved[i];
    try {
      const result = await conn.query("INSERT INTO immagine(path, idMacchina) VALUES(?, ?)", [path, idMacchina]);
      res.json({ result: true });
    } catch (err) {
      res.json({ result: false });
    }
  }
});

app.post("/registrazione", async function (req, res) {
  let requestData = req.body;
  let ruolo = requestData.admin;
  let query = "SELECT * FROM utenteTpsi WHERE username = ?";
  let inserts = [ requestData.username];
  let sql = mysql.format(query, inserts);

  try {
    const risultati = await conn.query(sql);
    if (risultati.length) {
      res.json({
        ["registra" + ruolo.charAt(0).toUpperCase() + ruolo.slice(1)]: false,
      });
    } else {
      bcrypt.hash(requestData.password, 10, async function (err, hash) {
        let query_insert =
          "INSERT INTO utenteTpsi (username, pass, mail) VALUES (?, ?, ?,?)";
        let inserts_insert = [
          requestData.username,
          hash,
          requestData.mail,
          requestData.admin
        ];
        let sql_insert = mysql.format(query_insert, inserts_insert);

        try {
          const risultati = await conn.query(sql_insert);
          res.json({
            result : ["registra" +   true]
          });
        } catch (errore) {
          res.json({
            result : ["registra" +   false]
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
  const stmt = conn.prepare("DELETE FROM macchina  WHERE idMacchina = ?");
  stmt.bind_param("s", requestBody.idMacchina);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un modello
app.delete("/deleteModello", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM modello  WHERE idModello = ?");
  stmt.bind_param("s", requestBody.idModello);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare una marca
app.delete("/deleteMarca", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM marca  WHERE idMarca = ?");
  stmt.bind_param("s", requestBody.idMarca);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare una transazione
app.delete("/deleteTransazione", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare(
    "DELETE FROM prelazione WHERE idMacchina = ? AND idUtente = ?",
  );
  stmt.bind_param("ss", requestBody.idMacchina, requestBody.idUtente);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un'immagine
app.delete("/deleteImmagini", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare(
    "DELETE FROM immagine WHERE idMacchina = ? AND idImmagine = ?",
  );
  stmt.bind_param("ss", requestBody.idMacchina, requestBody.idImmagine);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un preferito
app.delete("/deletePreferiti", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare(
    "DELETE FROM preferiti WHERE idMacchina = ? AND idUtente = ?",
  );
  stmt.bind_param("ss", requestBody.idMacchina, requestBody.idUtente);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un utente
app.delete("/deleteUtente", async (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM utente WHERE username = ?");
  stmt.bind_param("s", requestBody.username);
  try {
    await stmt.execute();
    res.json({ result: true });
  } catch (err) {
    res.json({ result: false });
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

// Metodo per ottenere le macchine
app.get("/macchina", async (req, res) => {
  let sql = "SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca";
  try {
    const result = await conn.query(sql);
    let data = [];
    for (let row of result) {
      let resultImg = await conn.query("SELECT * FROM immagine WHERE idMacchina = ?", [row.idMacchina]);
      let arrayImg = [];
      for (let rowImg of resultImg) {
        let path = rowImg.path;
        let base64Image = getBase64Image(path);
        arrayImg.push(base64Image);
      }
      row.immagini = arrayImg;
      data.push(row);
    }
    conn.end();
    res.json({ "result": data });
  } catch (err) {
    throw err;
  }
});

// Metodo per creare una nuova prelazione
app.post('/postPrelazione', async (req, res) => {
  let idUtente = req.body.idUtente;
  let stato = req.body.stato;
  let idMacchina = req.body.idMacchina;
  let data = new Date().toISOString().slice(0, 10);
  let query = `INSERT INTO prelazione(idUtente,idMacchina,data,stato) VALUES('${idUtente}','${idMacchina}','${data}','${stato}');`;
  try {
    const result = await conn.query(query);
    res.send({ result: true });
  } catch (err) {
    res.send({ result: false });
  }
});

// Metodo per aggiungere ai preferiti
app.post('/postPreferiti', async (req, res) => {
  let idMacchina = req.body.idMacchina;
  let idUtente = req.body.idUtente;
  let query = `INSERT INTO preferiti(idUtente,idMacchina) VALUES('${idUtente}','${idMacchina}');`;
  try {
    const result = await conn.query(query);
    res.send({ result: true });
  } catch (err) {
    res.send({ result: false });
  }
});

// Metodo per creare una nuova promozione
app.post('/postPromo', async (req, res) => {
  let nome = req.body.nome;
  let idMacchina = req.body.idMacchina;
  let descrizione = req.body.descrizione;
  let query = `INSERT INTO sconto(nome,descrizione,idMacchina) VALUES('${nome}','${descrizione}','${idMacchina}');`;
  try {
    const result = await conn.query(query);
    res.send({ result: true });
  } catch (err) {
    res.send({ result: false });
  }
});

// Metodo per creare un nuovo modello
app.post('/postModello', async (req, res) => {
  let nome = req.body.nome;
  let idMarca = req.body.idMarca;
  let query = `INSERT INTO modello(nome,idMarca) VALUES('${nome}','${idMarca}');`;
  try {
    const result = await conn.query(query);
    res.send({ result: true });
  } catch (err) {
    res.send({ result: false });
  }
});

// Metodo per creare una nuova marca
app.post('/postMarca', async (req, res) => {
  let nome = req.body.nome;
  let query = `INSERT INTO marca(nome) VALUES('${nome}');`;
  try {
    const result = await conn.query(query);
    res.send({ result: true });
  } catch (err) {
    res.send({ result: false });
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

  let stmt = conn.prepare("INSERT INTO macchina(carburante,descrizione,condizione,cambio,allestimento,anno,disponibilità,KM,prezzo,idModello) VALUES(?,?,?,?,?,?,?,?,?,?)");
  stmt.bind_param("ssssssiiii", carburante, descrizione, condizione, cambio, allestimento, anno, disponibilita, km, prezzo, idModello);
  // Esecuzione della query
  try {
    const result = await stmt.execute();
    // Successo: l'esecuzione è andata a buon fine
    let idMacchina = conn.insert_id;
    // Process images
    let images = requestData.images;
    for (let image of images) {
      // Generate a unique filename
      let filename = uniqid() + '.png';
      // Save the image to the filesystem
      fs.writeFileSync('immagini/' + filename, Buffer.from(image, 'base64'));
      // Insert the image path into the database
      let stmt = conn.prepare("INSERT INTO immagine(path, idMacchina) VALUES(?, ?)");
      stmt.bind_param("si", filename, idMacchina);
      await stmt.execute();
    }
    res.send({ result: true });
  } catch (err) {
    // Errore durante l'esecuzione
    res.send({ result: false, message: "Failed to execute the SQL statement" });
  }
  // Chiusura della connessione
  conn.close();
});


// Metodo per ottenere un'immagine
app.post("/immagine", async (req, res) => {
  const idMacchina = req.body.idMacchina;
  try {
    const result = await conn.query(
      "SELECT * FROM immagine WHERE idMacchina = ?",
      [idMacchina]
    );
    if (result.length > 0) {
      const path = result[0].path;
      const base64Image = getBase64Image(path);
      res.json({ result: base64Image });
    } else {
      res.json({ result: null });
    }
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le marche
app.get("/marca", async (req, res) => {
  try {
    const result = await conn.query("SELECT * FROM marca");
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere i modelli
app.get("/modello", async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT model.* FROM modello model JOIN marca mar ON model.idMarca = mar.idMarca"
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le transazioni
app.get("/transazione", async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT mar.nome, model.nome, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca"
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le auto preferite
app.get("/preferiti", async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT mar.nome, model.nome, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca"
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere un utente
app.post("/utente", async (req, res) => {
  const username = req.body.username;
  try {
    const result = await conn.query(
      "SELECT * FROM utente WHERE username = ?",
      [username]
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere un admin
app.post("/admin", async (req, res) => {
  const username = req.body.username;
  try {
    const result = await conn.query(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le promozioni
app.get("/promo", async (req, res) => {
  try {
    const result = await conn.query("SELECT * FROM sconto");
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le auto nuove
app.get("/autonuove", async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca WHERE mac.condizione = 'Nuovo'"
    );
    const data = [];
    for (let i = 0; i < result.length; i++) {
      data.push(result[i]);
    }
    res.json({ result: data });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere le auto usate
app.get("/autousate", async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca WHERE mac.condizione = 'Usato'"
    );
    const data = [];
    for (let i = 0; i < result.length; i++) {
      data.push(result[i]);
    }
    res.json({ result: data });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere l'elenco delle  chat di un admin
app.post("/chatAdmin", async (req, res) => {
  try {
    const result = await conn.query(
      "SELECT c.ID,u.username FROM Chat c JOIN utenteTpsi u ON u.id = c.idUtente"
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere tutti i messaggi di una chat
app.post("/messaggi", async (req, res) => {
  const chatId = req.body.chatId;
  try {
    const result = await conn.query(
      "SELECT * FROM Messaggio WHERE Chat_ID = ?",
      [chatId]
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per ottenere la chat di  un utente
app.post("/chatUtente", async (req, res) => {
  const username = req.body.username;
  try {
    const result = await conn.query(
      "SELECT c.ID FROM Chat c JOIN utenteTpsi u ON u.id = c.idUtente WHERE u.username = ?",
      [username]
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per creare una nuova chat
app.post("/newChat", async (req, res) => {
  const username = req.body.username;
  try {
    const result = await conn.query(
      "SELECT id FROM utenteTpsi  WHERE username = ?",
      [username]
    );
    await conn.query(
      "INSERT INTO Chat(idUtente) values(?)",
      [result[0].id]
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});

// Metodo per creare un nuovo messaggio
app.post("/newMessage", async (req, res) => {
  const username = req.body.username;
  const chatId = req.body.chatId;
  const testo = req.body.testo;
  let day = new Date();
  let data = day.toLocaleDateString("it-IT"); // Formatta la data in gg/mm/aaaa
  let ora = day.toLocaleTimeString("it-IT"); // Formatta l'ora in hh:mm:ss
  try {
    const result = await conn.query(
      "INSERT INTO Messaggio(Data,Mittente,Testo,Ora,Chat_ID) values(?,?,?,?,?)",
      [data, username, testo, ora, chatId]
    );
    res.json({ result });
  } catch (err) {
    throw err;
  }
});




const server = http.createServer(app);
server.listen(3000, () => {
  console.log("- server running");
});
