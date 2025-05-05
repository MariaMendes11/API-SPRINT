const validateSalas = require("../services/validateSalas");
const connect = require("../db/connect"); // Importa o módulo de conexão com o banco de dados

module.exports = class salaController {
  // Método para criar uma nova sala
  static async createSalas(req, res) {
    const { horarios_disponiveis, classificacao, bloco } = req.body;

    const validationError = validateSalas(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Query para inserir a nova sala no banco de dados
    const query = `INSERT INTO sala (horarios_disponiveis, classificacao, bloco) VALUES (?, ?, ?)`;
    const values = [horarios_disponiveis, classificacao, bloco];

    try {
      connect.query(query, values, function (err) {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: "A sala já existe",
            });
          }
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res.status(201).json({ message: "Sala Criada com Sucesso!" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Método para obter todas as salas
  static async getAllSalas(req, res) {
    const query = `SELECT * FROM sala`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Obtendo todas as salas", salas: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Bloco A

  static async getAllSalasA(req, res) {
    const query = `SELECT id_sala, classificacao, horarios_disponiveis, bloco FROM sala WHERE bloco = 'A'`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Obtendo todas as salas", salas: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Bloco B

  static async getAllSalasB(req, res) {
    const query = `SELECT id_sala, classificacao, horarios_disponiveis, bloco FROM sala WHERE bloco = 'B'`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Obtendo todas as salas", salas: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Bloco C

  static async getAllSalasC(req, res) {
    const query = `SELECT id_sala, classificacao, horarios_disponiveis, bloco FROM sala WHERE bloco = 'C'`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Obtendo todas as salas", salas: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Bloco D

  static async getAllSalasD(req, res) {
    const query = `SELECT id_sala, classificacao, horarios_disponiveis, bloco FROM sala WHERE bloco = 'D'`;

    try {
      connect.query(query, function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }
        return res
          .status(200)
          .json({ message: "Obtendo todas as salas", salas: results });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Método para atualizar os dados de uma sala
  static async updateSala(req, res) {
    const { horarios_disponiveis, classificacao, bloco } = req.body;
    const salaId = req.params.id_sala;


    // Query para atualizar os dados de uma sala
    const query = `UPDATE sala SET horarios_disponiveis = ?, classificacao = ?, bloco = ? WHERE id_sala = ?`;
    const values = [horarios_disponiveis, classificacao, bloco, salaId];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
              error: "A classificação já existe",
            });
          }
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }

        // Verifica se a sala foi encontrada e atualizada
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Sala não encontrada" });
        }
        return res.status(200).json({ message: "Sala atualizada com sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  // Método para excluir uma sala
  static async deleteSala(req, res) {
    const salaId = req.params.id_sala;
    const query = `DELETE FROM sala WHERE id_sala = ?`;
    const values = [salaId];

    try {
      connect.query(query, values, function (err, results) {
        if (err) {
          if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
              error:
                "A sala está vinculada a uma reserva, e não pode ser excluída",
            });
          }
          console.error(err);
          return res.status(500).json({ error: "Erro Interno do Servidor" });
        }

        // Verifica se a sala foi encontrada e excluída
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Sala não encontrada" });
        }
        return res.status(200).json({ message: "Sala excluída com sucesso" });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};
