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

app.post('/upload', (req, res) => {
  // Leggi il corpo della richiesta
  const requestBody = req.body;
  // Preparazione della query SQL
  const idMacchina = requestBody.idMacchina;
  const imgSaved = salvaImg(req);
  for (let i = 0; i < imgSaved.length; i++) {
      const path = imgSaved[i];
      // Esecuzione della query
      conn.query("INSERT INTO immagine(path, idMacchina) VALUES(?, ?)", [path, idMacchina], (err, result) => {
          if (err) {
              // Errore durante l'esecuzione
              res.json({ result: false });
          } else {
              // Successo: l'esecuzione è andata a buon fine
              res.json({ result: true });
          }
      });
  }
});

app.post("/registrazione", function (req, res) {
  let requestData = req.body;
  let ruolo = requestData.ruolo;
  let query = "SELECT * FROM utenteTpsi WHERE username = ?";
  let inserts = [ requestData.username];
  let sql = mysql.format(query, inserts);

  conn.query(sql, function (errore, risultati) {
    if (errore) throw errore;

    if (risultati.length) {
      res.json({
        ["registra" + ruolo.charAt(0).toUpperCase() + ruolo.slice(1)]: false,
      });
    } else {
      bcrypt.hash(requestData.password, 10, function (err, hash) {
        let query_insert =
          "INSERT INTO utenteTpsi (username, pass, mail) VALUES (?, ?, ?,?)";
        let inserts_insert = [
          requestData.username,
          hash,
          requestData.mail,
          requestData.admin
        ];
        let sql_insert = mysql.format(query_insert, inserts_insert);

        conn.query(sql_insert, function (errore, risultati) {
          if (errore) {
            res.json({
              result : ["registra" +   false]
            });
          } else {
            res.json({
              result : ["registra" +   true]
            });
          }
        });
      });
    }
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;


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

// Metodo per eliminare un'auto
app.delete("/deleteAuto", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM macchina  WHERE idMacchina = ?");
  stmt.bind_param("s", requestBody.idMacchina);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un modello
app.delete("/deleteModello", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM modello  WHERE idModello = ?");
  stmt.bind_param("s", requestBody.idModello);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare una marca
app.delete("/deleteMarca", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM marca  WHERE idMarca = ?");
  stmt.bind_param("s", requestBody.idMarca);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare una transazione
app.delete("/deleteTransazione", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare(
    "DELETE FROM prelazione WHERE idMacchina = ? AND idUtente = ?",
  );
  stmt.bind_param("ss", requestBody.idMacchina, requestBody.idUtente);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un'immagine
app.delete("/deleteImmagini", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare(
    "DELETE FROM immagine WHERE idMacchina = ? AND idImmagine = ?",
  );
  stmt.bind_param("ss", requestBody.idMacchina, requestBody.idImmagine);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un preferito
app.delete("/deletePreferiti", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare(
    "DELETE FROM preferiti WHERE idMacchina = ? AND idUtente = ?",
  );
  stmt.bind_param("ss", requestBody.idMacchina, requestBody.idUtente);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un utente
app.delete("/deleteUtente", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM utente WHERE username = ?");
  stmt.bind_param("s", requestBody.username);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare un admin
app.delete("/deleteAdmin", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM admin WHERE username = ?");
  stmt.bind_param("s", requestBody.username);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Metodo per eliminare una promozione
app.delete("/deletePromo", (req, res) => {
  const requestBody = req.body;
  const stmt = conn.prepare("DELETE FROM sconto WHERE idSconto = ?");
  stmt.bind_param("s", requestBody.idSconto);
  if (stmt.execute()) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
  conn.close();
});

// Funzione per ottenere l'immagine in base64
function getBase64Image(path) {
  if (fs.existsSync(path)) {
    const imageData = fs.readFileSync(path);
    return Buffer.from(imageData).toString("base64");
  }
  return null;
}

// Metodo per ottenere un'immagine
app.post("/immagine", (req, res) => {
  const idMacchina = req.body.idMacchina;
  conn.query(
    "SELECT * FROM immagine WHERE idMacchina = ?",
    [idMacchina],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        const path = result[0].path;
        const base64Image = getBase64Image(path);
        res.json({ result: base64Image });
      } else {
        res.json({ result: null });
      }
    },
  );
});

// Metodo per ottenere le marche
app.get("/marca", (req, res) => {
  conn.query("SELECT * FROM marca", (err, result) => {
    if (err) throw err;
    res.json({ result });
  });
});

// Metodo per ottenere i modelli
app.get("/modello", (req, res) => {
  conn.query(
    "SELECT model.* FROM modello model JOIN marca mar ON model.idMarca = mar.idMarca",
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

app.get("/macchina", (req, res) => {

  let sql = "SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca";
  conn.query(sql, (err, result) => {
    if (err) throw err;
    let data = [];
    result.forEach((row) => {
      let sqlImg = "SELECT * FROM immagine WHERE idMacchina = ?";
      conn.query(sqlImg, [row.idMacchina], (err, resultImg) => {
        if (err) throw err;
        let arrayImg = [];
        resultImg.forEach((rowImg) => {
          let path = rowImg.path;
          let base64Image = getBase64Image(path);
          arrayImg.push(base64Image);
        });
        row.immagini = arrayImg;
        data.push(row);
      });
    });
    conn.end();
    res.json({ "result": data });
  });
});


// Metodo per ottenere le transazioni
app.get("/transazione", (req, res) => {
  conn.query(
    "SELECT mar.nome, model.nome, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca",
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per ottenere le auto preferite
app.get("/preferiti", (req, res) => {
  conn.query(
    "SELECT mar.nome, model.nome, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca",
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per ottenere un utente
app.post("/utente", (req, res) => {
  const username = req.body.username;
  conn.query(
    "SELECT * FROM utente WHERE username = ?",
    [username],
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per ottenere un admin
app.post("/admin", (req, res) => {
  const username = req.body.username;
  conn.query(
    "SELECT * FROM admin WHERE username = ?",
    [username],
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per ottenere le promozioni
app.get("/promo", (req, res) => {
  conn.query("SELECT * FROM sconto", (err, result) => {
    if (err) throw err;
    res.json({ result });
  });
});

// Metodo per ottenere le auto nuove
app.get("/autonuove", (req, res) => {
  conn.query(
    "SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca WHERE mac.condizione = 'Nuovo'",
    (err, result) => {
      if (err) throw err;
      const data = [];
      for (let i = 0; i < result.length; i++) {
        data.push(result[i]);
      }
      res.json({ result: data });
    },
  );
});

// Metodo per ottenere le auto usate
app.get("/autousate", (req, res) => {
  conn.query(
    "SELECT mar.nome AS marca, model.nome AS modello, mac.* FROM macchina mac JOIN modello model ON mac.idModello = model.idModello JOIN marca mar ON model.idMarca = mar.idMarca WHERE mac.condizione = 'Usato'",
    (err, result) => {
      if (err) throw err;
      const data = [];
      for (let i = 0; i < result.length; i++) {
        data.push(result[i]);
      }
      res.json({ result: data });
    },
  );
});
// Metodo per ottenere l'elenco delle  chat di un admin
app.post("/chatAdmin", (req, res) => {
  conn.query(
    "SELECT c.ID,u.username FROM Chat c JOIN utenteTpsi u ON u.id = c.idUtente",
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per ottenere tutti i messaggi di una chat
app.post("/messaggi", (req, res) => {
  const chatId = req.body.chatId;
  conn.query(
    "SELECT * FROM Messaggio WHERE Chat_ID = ?",
    [chatId],
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per ottenere la chat di  un utente
app.post("/chatUtente", (req, res) => {
  const username = req.body.username;
  conn.query(
    "SELECT c.ID FROM Chat c JOIN utenteTpsi u ON u.id = c.idUtente WHERE u.username = ?",
    [username],
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});

// Metodo per creare una nuova chat
app.post("/newChat", (req, res) => {
  const username = req.body.username;
  conn.query(
    "SELECT id FROM utenteTpsi  WHERE username = ?",
    [username],
    (err, result) => {
      if (err) throw err;
      conn.query(       
    "INSERT INTO Chat(idUtente) values(?)",
        [result[0].id],
      );
      res.json({ result });
    },
  );
});

// Metodo per creare un nuovo messaggio
app.post("/newMessage", (req, res) => {
  const username = req.body.username;
  const chatId = req.body.chatId;
  const testo = req.body.testo;
  let day = new Date();
  let data = day.toLocaleDateString("it-IT"); // Formatta la data in gg/mm/aaaa
  let ora = day.toLocaleTimeString("it-IT"); // Formatta l'ora in hh:mm:ss
  conn.query(
    "INSERT INTO Messaggio(Data,Mittente,Testo,Ora,Chat_ID) values(?,?,?,?,?)",
    [data, username, testo, ora, chatId],
    (err, result) => {
      if (err) throw err;
      res.json({ result });
    },
  );
});



app.post('/postPrelazione', (req, res) => {
  let idUtente = req.body.idUtente;
  let stato = req.body.stato;
  let idMacchina = req.body.idMacchina;
  let data = new Date().toISOString().slice(0, 10);
  let query = `INSERT INTO prelazione(idUtente,idMacchina,data,stato) VALUES('${idUtente}','${idMacchina}','${data}','${stato}');`;
  conn.query(query, (err, result) => {
    if (err) {
      res.send({ result: false });
    } else {
      res.send({ result: true });
    }
  });
});

app.post('/postPreferiti', (req, res) => {
  let idMacchina = req.body.idMacchina;
  let idUtente = req.body.idUtente;
  let query = `INSERT INTO preferiti(idUtente,idMacchina) VALUES('${idUtente}','${idMacchina}');`;
  conn.query(query, (err, result) => {
    if (err) {
      res.send({ result: false });
    } else {
      res.send({ result: true });
    }
  });
});

app.post('/postPromo', (req, res) => {
  let nome = req.body.nome;
  let idMacchina = req.body.idMacchina;
  let descrizione = req.body.descrizione;
  let query = `INSERT INTO sconto(nome,descrizione,idMacchina) VALUES('${nome}','${descrizione}','${idMacchina}');`;
  conn.query(query, (err, result) => {
    if (err) {
      res.send({ result: false });
    } else {
      res.send({ result: true });
    }
  });
});

app.post('/postModello', (req, res) => {
  let nome = req.body.nome;
  let idMarca = req.body.idMarca;
  let query = `INSERT INTO modello(nome,idMarca) VALUES('${nome}','${idMarca}');`;
  conn.query(query, (err, result) => {
    if (err) {
      res.send({ result: false });
    } else {
      res.send({ result: true });
    }
  });
});

app.post('/postMarca', (req, res) => {
  let nome = req.body.nome;
  let query = `INSERT INTO marca(nome) VALUES('${nome}');`;
  conn.query(query, (err, result) => {
    if (err) {
      res.send({ result: false });
    } else {
      res.send({ result: true });
    }
  });
});

app.post('/postAuto', (req, res) => {
  let carburante = req.body.carburante;
  let descrizione = req.body.descrizione;
  let condizione = req.body.condizione;
  let cambio = req.body.cambio;
  let allestimento = req.body.allestimento;
  let anno = req.body.anno;
  let disponibilità = req.body.disponibilità;
  let km = req.body.km;
  let prezzo = req.body.prezzo;
  let idModello = req.body.idModello;
  let query = `INSERT INTO macchina(carburante,descrizione,condizione,cambio,allestimento,anno,disponibilità,KM,prezzo,idModello) VALUES('${carburante}','${descrizione}','${condizione}','${cambio}','${allestimento}','${anno}','${disponibilità}','${km}','${prezzo}','${idModello}');`;
  conn.query(query, (err, result) => {
    if (err) {
      res.send({ result: false });
    } else {
      res.send({ result: true });
    }
  });
});

const server = http.createServer(app);
server.listen(3000, () => {
  console.log("- server running");
});
