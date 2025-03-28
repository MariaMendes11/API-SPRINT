const connect = require("../db/connect");
const validateUser = require("../services/validateUser");
const validateCpf = require("../services/validateCpf");

module.exports = class userController {
  // Função para criação de usuário
  static async createUser(req, res) {
    const {  nome, email, cpf, senha } = req.body;

    const validationError = validateUser(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    try {
      const cpfError = await validateCpf(cpf);
      if (cpfError) {
        return res.status(400).json(cpfError);
      }
    

      // Construção da query INSERT
      const query = `INSERT INTO usuario (nome, email, cpf, senha) VALUES ('${nome}', '${email}', '${cpf}', '${senha}')`;
      connect.query(query, function (err, results) {
        if (err) {
          console.log(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "O email já está vinculado a outro usuário" });
          }
            } else {
              return res
            .status(201)
            .json({ message: "Usuário cadastrado com sucesso" });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // função para alteração PUT
  static async updateUser(req, res) {
    const { id, nome, email, cpf, senha } = req.body;

    if (!id || !nome || !email || !cpf || !senha) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }
    const query = `UPDATE usuario SET nome=?, email=?, cpf=?, senha=? WHERE id_usuario=?`;
    const values = [nome, email, cpf, senha, id];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: "Email já está cadastrado por outro usuário",
            });
          } else {
            console.error(err);
            return res.status(500).json({ error: "Erro interno do servidor" });
          }
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado" });
        }
        return res
          .status(200)
          .json({ message: "Usuário atualizado com sucesso" });
      });
    } catch (error) {
      console.error("Erro ao executar consulta", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // Função para exclusão DELETE
  static async deleteUser(req, res) {
    const usuarioId = req.params.id;
    const query = `DELETE FROM usuario WHERE id_usuario = ?`;
    const values = [usuarioId];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Usuário não encontrado" });
        }
        return res
          .status(200)
          .json({ message: "Usuário excluído com sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }

  // Função para pegar todos os usuários
  static async getAllUsers(req, res) {
    const query = `SELECT * FROM usuario`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }
        return res
          .status(200)
          .json({ message: "Lista de usuários", users: results });
      });
    } catch (error) {
      console.error("Erro ao executar consulta:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // Função para login POST
  static async loginUser(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Os campos devem ser preenchidos" });
    }
    const query = `SELECT * FROM usuario WHERE email = ? AND senha = ?`;
    const values = [email, senha];

    try {
      connect.query(query, values, function (err, results) {
        if (results.length === 0) {
          return res.status(404).json({ error: "Email ou senha incorretos" });
        }
        return res.status(200).json({
          message: "Login realizado com sucesso",
        });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
