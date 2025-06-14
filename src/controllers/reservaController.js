const validateReservas = require("../services/validateReservas");
// Importa o módulo de conexão com o banco de dados
const connect = require("../db/connect");
// Importa a biblioteca moment-timezone para trabalhar com datas e fusos horários
const moment = require("moment-timezone");

// Define a classe reservaController que contém os métodos para lidar com as reservas
module.exports = class reservaController {
  // Método para criar uma nova reserva
  static async createReserva(req, res) {
    const { fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim } =
      req.body;

      // Validação do formato ISO 8601 das datas
  if (
    !moment(datahora_inicio, moment.ISO_8601, true).isValid() ||
    !moment(datahora_fim, moment.ISO_8601, true).isValid()
  ) {
    return res.status(400).json({ error: "Formato de data inválido" });
  }

    console.log(
      "-----Chegou do body------: ",
      fk_id_usuario,
      fk_id_sala,
      datahora_inicio,
      datahora_fim
    );

    //data recebida no formato ISO 8601 (com "Z" indicando UTC)
    // Converte para o formato MySQL: "YYYY-MM-DD HH:mm:ss"
    const datahora_inicio_mysql = moment(datahora_inicio).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const datahora_fim_mysql = moment(datahora_fim).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    console.log("Data e hora de início (MySQL):", datahora_inicio_mysql);
    console.log("Data e hora de fim (MySQL):", datahora_fim_mysql);

    const validationError = validateReservas(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Verifica se o usuário existe no banco
    const queryUsuario = `SELECT * FROM usuario WHERE id_usuario = ?`;
    const valuesUsuario = [fk_id_usuario];

    // Verifica se a sala existe no banco
    const querySala = `SELECT * FROM sala WHERE id_sala = ?`;
    const valuesSala = [fk_id_sala];

    // Verifica se a sala já está reservada no horário solicitado
    const queryHorario = `SELECT datahora_inicio, datahora_fim FROM reserva WHERE fk_id_sala = ? AND (
      (datahora_inicio < ? AND datahora_fim > ?) OR
      (datahora_inicio < ? AND datahora_fim > ?) OR
      (datahora_inicio >= ? AND datahora_inicio < ?) OR
      (datahora_fim > ? AND datahora_fim <= ?)
    )`;
    const valuesHorario = [
      fk_id_sala,
      datahora_inicio_mysql,
      datahora_inicio_mysql,
      datahora_inicio_mysql,
      datahora_fim_mysql,
      datahora_inicio_mysql,
      datahora_fim_mysql,
      datahora_inicio_mysql,
      datahora_fim_mysql,
    ];

    // Verifica se a sala já está reservada e se o usuário e a sala existem
    connect.query(queryHorario, valuesHorario, (err, resultadosH) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao verificar horário" });
      }

      connect.query(queryUsuario, valuesUsuario, (err, resultadosU) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao buscar usuário" });
        }

        connect.query(querySala, valuesSala, (err, resultadosS) => {
          if (err) {
            return res.status(500).json({ error: "Erro ao buscar sala" });
          }

          // Verifica se o usuário foi encontrado
          if (resultadosU.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
          }

          // Verifica se a sala foi encontrada
          if (resultadosS.length === 0) {
            return res.status(404).json({ error: "Sala não encontrada" });
          }

          // Valida se a data de fim é maior que a data de início
          if (
            new Date(datahora_fim_mysql).getTime() <
            new Date(datahora_inicio_mysql).getTime()
          ) {
            return res.status(400).json({ error: "Data ou Hora inválida" });
          }

          // Valida se a data de fim não é igual à data de início
          if (
            new Date(datahora_fim_mysql).getTime() ===
            new Date(datahora_inicio_mysql).getTime()
          ) {
            return res.status(400).json({ error: "Data ou Hora inválida" });
          }

          // Define o limite de tempo de reserva para 1 hora
          const limiteHora = 60 * 60 * 1000; // 1 hora em milissegundos
          if (
            new Date(datahora_fim_mysql) - new Date(datahora_inicio_mysql) >
            limiteHora
          ) {
            return res
              .status(400)
              .json({ error: "O tempo de reserva excede o limite (1h)" });
          }

          // Verifica se a sala já está reservada para o horário solicitado
          if (resultadosH.length > 0) {
            return res.status(400).json({
              error: "A sala escolhida já está reservada neste horário",
            });
          }

          // Insere a nova reserva no banco de dados
          const queryInsert = `INSERT INTO reserva (fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim) VALUES (?, ?, ?, ?)`;
          const valuesInsert = [
            fk_id_usuario,
            fk_id_sala,
            datahora_inicio_mysql,
            datahora_fim_mysql,
          ];

          // Executa a consulta para inserir a reserva
          connect.query(queryInsert, valuesInsert, (err, results) => {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Erro ao criar reserva" });
            }

            // Retorna uma resposta de sucesso se a reserva foi criada com sucesso
            return res
              .status(201)
              .json({ message: "Reserva cadastrada com sucesso!" });
          });
        });
      });
    });
  }

  // Método para obter todas as reservas
  static async getAllReserva(req, res) {
    const query = `
        SELECT reserva.*, usuario.nome 
        FROM reserva 
        JOIN usuario ON reserva.fk_id_usuario = usuario.id_usuario
    `;

    // Executa a consulta para obter todas as reservas
    connect.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro Interno do Servidor" });
      }

      // Converte as datas para o fuso horário local antes de enviar a resposta
      const reserva = results.map((reserva) => ({
        ...reserva,
        datahora_inicio: moment
          .utc(reserva.datahora_inicio)
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
        datahora_fim: moment
          .utc(reserva.datahora_fim)
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
      }));

      // Retorna todas as reservas com as datas ajustadas
      return res
        .status(200)
        .json({ message: "Obtendo todas as reservas", reservas: reserva });
    });
  }

  // Método para obter as reservas de um usuário específico
  static async getReservaByUsuario(req, res) {
    
    const usuarioId = req.params.id; // Recupera o ID do usuário via parâmetro da URL

    // Verifica se o ID do usuário foi fornecido
    if (!usuarioId) {
      return res.status(400).json({ error: "ID do usuário é obrigatório" });
    }

    // Consulta para obter as reservas do usuário
    const query = `
    SELECT r.*, s.classificacao, s.horarios_disponiveis, s.bloco
    FROM reserva r
    JOIN sala s ON r.fk_id_sala = s.id_sala
    WHERE r.fk_id_usuario = ?`;
    const values = [usuarioId];

    // Executa a consulta para buscar as reservas do usuário
    connect.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao buscar reservas" });
      }
      console.log(results)
      // Se não houver reservas, retorna um erro
      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Nenhuma reserva encontrada para esse usuário" });
      }
      
      // Converte as datas para o fuso horário local antes de enviar a resposta
      const reservas = results.map((reserva) => ({
        ...reserva,
        datahora_inicio: moment
          .utc(reserva.datahora_inicio)
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
        datahora_fim: moment
          .utc(reserva.datahora_fim)
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
      }));

      // Retorna as reservas encontradas
      return res.status(200).json({ message: "Reservas do usuário", reservas });
    });
  }

  // Método para atualizar uma reserva
  static async updateReserva(req, res) {
    const { datahora_inicio, datahora_fim } = req.body;
    const reservaId = req.params.id; // Recupera o ID da reserva via parâmetros da URL

    // Validação do formato ISO 8601 das datas
  if (
    !moment(datahora_inicio, moment.ISO_8601, true).isValid() ||
    !moment(datahora_fim, moment.ISO_8601, true).isValid()
  ) {
    return res.status(400).json({ error: "Formato de data inválido" });
  }

    const validationError = validateReservas(req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Consulta para verificar se a sala já está reservada no novo horário
    const queryHorario = `SELECT id_reserva FROM reserva WHERE fk_id_sala = (
        SELECT fk_id_sala FROM reserva WHERE id_reserva = ?
        ) AND id_reserva != ? AND (
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio < ? AND datahora_fim > ?) OR
        (datahora_inicio >= ? AND datahora_inicio < ?) OR
        (datahora_fim > ? AND datahora_fim <= ?)
    )`;
    const valuesHorario = [
      reservaId,
      reservaId,
      datahora_inicio,
      datahora_inicio,
      datahora_inicio,
      datahora_fim,
      datahora_inicio,
      datahora_fim,
      datahora_inicio,
      datahora_fim,
    ];

    // Consulta para atualizar a reserva
    const queryUpdate = `UPDATE reserva SET datahora_inicio = ?, datahora_fim = ? WHERE id_reserva = ?`;
    const valuesUpdate = [datahora_inicio, datahora_fim, reservaId];

    // Verifica se a sala já está reservada no novo horário
    connect.query(queryHorario, valuesHorario, (err, resultadosH) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao verificar horário" });
      }

      if (resultadosH.length > 0) {
        return res
          .status(400)
          .json({ error: "A sala já está reservada neste horário" });
      }

      // Verifica se a data de fim é maior que a de início
      if (new Date(datahora_fim) < new Date(datahora_inicio)) {
        return res.status(400).json({ error: "Data ou Hora inválida" });
      }

      // Verifica se o horário de início é igual ao horário de fim
      if (
        new Date(datahora_inicio).getTime() === new Date(datahora_fim).getTime()
      ) {
        return res.status(400).json({
          error:
            "A data e hora de início não podem ser iguais à data e hora de fim.",
        });
      }

      // Verifica se o tempo de reserva excede 1 hora
      const limiteHora = 60 * 60 * 1000; // 1 hora em milissegundos
      if (new Date(datahora_fim) - new Date(datahora_inicio) > limiteHora) {
        return res
          .status(400)
          .json({ error: "O tempo de reserva excede o limite (1h)" });
      }

      // Executa a consulta para atualizar a reserva
      connect.query(queryUpdate, valuesUpdate, (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao atualizar reserva" });
        }

        // Verifica se alguma linha foi realmente afetada (se a reserva foi atualizada)
        if (results.affectedRows === 0) {
          return res
            .status(404)
            .json({ error: "Reserva não encontrada ou sem alterações" });
        }

        // Retorna uma resposta de sucesso se a reserva foi atualizada
        return res.status(200).json({
          message: "Reserva atualizada com sucesso!",
          reservaId,
          datahora_inicio,
          datahora_fim,
        });
      });
    });
  }

  // Método para excluir uma reserva
  static async deleteReserva(req, res) {
    const reservaId = req.params.id; // Recupera o ID da reserva via parâmetros da URL
    const query = `DELETE FROM reserva WHERE id_reserva = ?`;
    const values = [reservaId];

    // Executa a consulta para excluir a reserva
    connect.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro interno no servidor" });
      }

      // Verifica se a reserva foi encontrada e excluída
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Reserva não encontrada" });
      }

      // Retorna uma resposta de sucesso se a reserva foi excluída
      return res.status(200).json({ message: "Reserva excluída com sucesso" });
    });
  }

  
  // consultar reservas por id de sala e data
  static async getReservaIdData(req, res) {
    const { fk_id_sala, datahora_inicio } = req.body;

    const query = `
        SELECT r.*, usuario.nome 
        FROM reserva r
        JOIN usuario ON r.fk_id_usuario = usuario.id_usuario
        where r.fk_id_sala = ? and DATE(r.datahora_inicio) = ?
    `;

    const values = [fk_id_sala, datahora_inicio];

    console.log("body: ", values);

    // Executa a consulta para obter todas as reservas
    connect.query(query, values, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro Interno do Servidor" });
      }

      // Converte as datas para o fuso horário local antes de enviar a resposta
      const reserva = results.map((reserva) => ({
        ...reserva,
        datahora_inicio: moment
          .utc(reserva.datahora_inicio)
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
        datahora_fim: moment
          .utc(reserva.datahora_fim)
          .tz("America/Sao_Paulo")
          .format("YYYY-MM-DD HH:mm:ss"),
      }));

      // Retorna todas as reservas com as datas ajustadas
      return res
        .status(200)
        .json({ message: "Obtendo todas as reservas", reservas: reserva });
    });
  }
};
