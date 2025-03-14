const connect = require("../db/connect");

module.exports = class controladorDeSalas {
  static async criarSala(req, res) {
    const { nome, disponibilidade, bloco } = req.body;

    // Verifica se todos os campos estão preenchidos
    if (!nome || !disponibilidade || !bloco) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Caso todos os campos estejam preenchidos, realiza a inserção na tabela
    const query = `INSERT INTO sala (nome, disponibilidade, bloco) VALUES ( 
        '${nome}', 
        '${disponibilidade}', 
        '${bloco}'
      )`;

    try {
      connect.query(query, function (err) {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Erro ao cadastrar sala" });
          return;
        }
        console.log("Sala cadastrada com sucesso");
        res.status(201).json({ message: "Sala cadastrada com sucesso" });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async obterTodasAsSalas(req, res) {
    try {
      const query = "SELECT * FROM sala";
      connect.query(query, function (err, result) {
        if (err) {
          console.error("Erro ao obter salas:", err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }
        console.log("Salas obtidas com sucesso");
        res.status(200).json({ salas: result });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async obterSalaPorId(req, res) {
    const idSala = req.params.numero;

    try {
      const query = `SELECT * FROM sala WHERE numero = '${idSala}'`;
      connect.query(query, function (err, result) {
        if (err) {
          console.error("Erro ao obter sala:", err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: "Sala não encontrada" });
        }

        console.log("Sala obtida com sucesso");
        res.status(200).json({
          message: "Obtendo a sala com ID: " + idSala,
          sala: result[0],
        });
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async atualizarSala(req, res) {
    const { nome, disponibilidade, bloco } = req.body;

    // Validar campos obrigatórios
    if (!nome || !disponibilidade || !bloco) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    try {
      // Verificar se a sala existe
      const findQuery = `SELECT * FROM sala WHERE nome = ?`;
      connect.query(findQuery, [nome], function (err, result) {
        if (err) {
          console.error("Erro ao buscar a sala:", err);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.length === 0) {
          return res.status(404).json({ error: "Sala não encontrada" });
        }

        // Atualizar a sala
        const updateQuery = `
              UPDATE sala 
              SET disponibilidade = ?, bloco = ?
              WHERE nome = ?
          `;
        connect.query(
          updateQuery,
          [disponibilidade, bloco, nome],
          function (err) {
            if (err) {
              console.error("Erro ao atualizar a sala:", err);
              return res
                .status(500)
                .json({ error: "Erro interno do servidor" });
            }

            console.log("Sala atualizada com sucesso");
            res.status(200).json({ message: "Sala atualizada com sucesso" });
          }
        );
      });
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async deletarSala(req, res) {
    const idSala = req.params.numero;
    try {
      // Verificar se há reservas associadas à sala
      const checkReservationsQuery = `SELECT * FROM agendamento WHERE sala = ?`;
      connect.query(
        checkReservationsQuery,
        [idSala],
        function (err, reservas) {
          if (err) {
            console.error("Erro ao verificar reservas:", err);
            return res.status(500).json({ error: "Erro interno do servidor" });
          }

          // Verificar se existem reservas associadas
          if (reservas.length > 0) {
            // Impedir exclusão e retornar erro
            return res
              .status(400)
              .json({
                error:
                  "Não é possível excluir a sala, pois há reservas associadas.",
              });
          } else {
            // Deletar a sala
            const deleteQuery = `DELETE FROM sala WHERE numero = ?`;
            connect.query(deleteQuery, [idSala], function (err, result) {
              if (err) {
                console.error("Erro ao deletar a sala:", err);
                return res
                  .status(500)
                  .json({ error: "Erro ao deletar a sala" });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Sala não encontrada" });
              }

              console.log("Sala deletada com sucesso");
              res.status(200).json({ message: "Sala excluída com sucesso" });
            });
          }
        }
      );
    } catch (error) {
      console.error("Erro ao executar a consulta:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
