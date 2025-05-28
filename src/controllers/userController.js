const connect = require("../db/connect");
const validateUser = require("../services/validateUser");
const validateCpf = require("../services/validateCpf");
const jwt = require("jsonwebtoken"); // Importar

module.exports = class userController {
  // Função para criação de usuário
  static async createUser(req, res) {
    const { nome, email, cpf, senha } = req.body;

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

  // Função para alteração PUT (com validação de token)
  static async updateUser(req, res) {
    const { nome, email, cpf, senha } = req.body;
    const id_usuario = req.params.id;
  
    // Verifica se o usuário está tentando editar a própria conta
    if (Number(id_usuario) !== Number(req.userId)) {
      return res
        .status(403)
        .json({ error: "Você só pode editar sua própria conta." });
    }
  
    try {
      // Busca o CPF original no banco antes de validar
      const selectQuery = "SELECT cpf FROM usuario WHERE id_usuario = ?";
      connect.query(selectQuery, [id_usuario], function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro ao buscar o usuário" });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ error: "Usuário não encontrado" });
        }
  
        const cpfOriginal = results[0].cpf;
  
        // Valida os dados, incluindo a verificação de CPF imutável
        const validationError = validateUser({ nome, email, cpf, senha, cpfOriginal });
        if (validationError) {
          return res.status(400).json(validationError);
        }
  
        // Continua com o update se passou na validação
        const updateQuery = `UPDATE usuario SET nome=?, email=?, senha=? WHERE id_usuario=?`;
        const values = [nome, email, senha, id_usuario]; // Remove o CPF do update
  
        connect.query(updateQuery, values, function (err, results) {
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
      });
    } catch (error) {
      console.error("Erro ao executar consulta", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  

  // Função para exclusão DELETE (com validação de token)
  static async deleteUser(req, res) {
    const usuarioId = req.params.id; // ID vindo da rota (ex: /usuario/:id)
    const userIdFromToken = req.userId; // ID recuperado do token pelo middleware

    // Verifica se o usuário está tentando deletar sua própria conta
    if (Number(usuarioId) !== Number(userIdFromToken)) {
      console.log("ID da URL:", usuarioId);
      console.log("ID do token:", userIdFromToken);

      return res
        .status(403)
        .json({ error: "Você só pode excluir sua própria conta." });
    }

    const query = `DELETE FROM usuario WHERE id_usuario = ?`;

    try {
      connect.query(query, [usuarioId], (err, results) => {
        if (err) {
          console.error("Erro ao excluir usuário:", err);
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
      console.error("Erro na exclusão do usuário:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
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
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const query = `SELECT * FROM usuario WHERE email = ?`;

    try {
      connect.query(query, [email], (err, results) => {
        if (err) {
          console.error("Erro ao executar a consulta:", err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (results.length === 0) {
          return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const user = results[0];

        if (user.senha !== senha) {
          return res.status(401).json({ error: "Senha incorreta" });
        }

        const token = jwt.sign({ id: user.id_usuario }, process.env.SECRET, {
          expiresIn: "1h",
        });

        // remove a senha do retorno
        delete user.senha;

        return res.status(200).json({
          message: "Login bem-sucedido",
          user,
          token,
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
