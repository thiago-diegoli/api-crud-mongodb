const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

const app = express();
const PORT = process.env.PORT || 3333;
const DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/FatecVotorantim";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("X-HTTP-Method"));
app.use(methodOverride("X-HTTP-Method-Override"));
app.use(methodOverride("X-Method-Override"));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept"
  );
  next();
});

mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("Conectado ao Mongo com sucesso"))
  .catch((erro) => console.error(erro));

const usuarioSchema = new mongoose.Schema({
  name: String,
  idade: Number,
  sexo: String,
});
const Usuario = mongoose.model("Usuarios", usuarioSchema);

// GET
app.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    res.json(usuarios);
  } catch (erro) {
    res.status(500).json({
      status: "erro",
      mensagem: "Falha ao buscar usuários",
      erro: erro.message,
    });
  }
});

// POST
app.post("/add", async (req, res) => {
  try {
    const { name, idade, sexo } = req.body;

    const novoUsuario = new Usuario({
      name,
      idade,
      sexo,
    });

    await novoUsuario.save();
    res
      .status(201)
      .json({ status: "sucesso", mensagem: "Usuário adicionado com sucesso" });
  } catch (erro) {
    res.status(400).json({
      status: "erro",
      mensagem: "Falha ao adicionar usuário",
      erro: erro.message,
    });
  }
});

// PUT
app.put("/update/:id", async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const dadosAtualizacao = req.body;
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      idUsuario,
      dadosAtualizacao
    );

    if (usuarioAtualizado) {
      res.json({
        status: "sucesso",
        mensagem: "Usuário atualizado com sucesso",
      });
    } else {
      res
        .status(404)
        .json({ status: "erro", mensagem: "Usuário não encontrado" });
    }
  } catch (erro) {
    res.status(400).json({
      status: "erro",
      mensagem: "Falha ao atualizar usuário",
      erro: erro.message,
    });
  }
});

// DELETE
app.delete("/delete/:id", async (req, res) => {
  try {
    const idUsuario = req.params.id;
    const usuarioRemovido = await Usuario.findByIdAndDelete(idUsuario);

    if (usuarioRemovido) {
      res.json({ status: "sucesso", mensagem: "Usuário removido com sucesso" });
    } else {
      res
        .status(404)
        .json({ status: "erro", mensagem: "Usuário não encontrado" });
    }
  } catch (erro) {
    res.status(400).json({
      status: "erro",
      mensagem: "Falha ao remover usuário",
      erro: erro.message,
    });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
