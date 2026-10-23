const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "zenitucha"
};

app.get("/users", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute("SELECT * FROM users");
    await connection.end();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
    console.log(erro)
  }
});


app.post("/users", async (req, res) => {
  try {
    const { nome, email, password } = req.body;

    const connection = await mysql.createConnection(dbConfig);
    console.log(req.body);
    await connection.execute(
      "INSERT INTO users (nome, email,password) VALUES (?, ?, ?)",
      [nome, email, password]
    );

    await connection.end();

    res.json({ message: "User criado com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(5000, () => {
  console.log("API rodando na porta 3000");
});

