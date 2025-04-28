const connect = require("../db/connect");
const validateUser = require("../services/validateUser");
const validateCpf = require("../services/validateCpf");
const jwt = require("jsonwebtoken");


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
    const { email, password } = req.body;
  
    if (!email || !password) {
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
  
        // Verificar se a senha fornecida é a mesma que está no banco de dados
        // Aqui, você deveria usar bcryptjs para comparar a senha criptografada
        if (user.senha !== password) {
          return res.status(401).json({ error: "Senha incorreta" });
        }
  
        // Gerar token JWT
        const token = jwt.sign({ id: user.id_usuario }, process.env.SECRET, {
          expiresIn: "1h", // O token expirará após 1 hora
        });
  
        // Remover a senha do objeto de usuário antes de retornar para a resposta
        delete user.senha;
  
        return res.status(200).json({
          message: "Login bem-sucedido",
          user,
          token, // Retorna o token JWT gerado
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
  
