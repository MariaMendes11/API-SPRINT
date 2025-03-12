const conectar = require("../db/connect");

// Verificar se o horário de início de um agendamento está dentro de um intervalo de tempo
function estaNoIntervaloDeTempo(horarioInicio, intervaloTempo) {
  const [inicio, fim] = intervaloTempo.split(" - ");
  const horarioInicioEmMs = new Date(`1970-01-01T${inicio}`).getTime();
  const horarioFimEmMs = new Date(`1970-01-01T${fim}`).getTime();
  const horarioAgendamentoEmMs = new Date(`1970-01-01T${horarioInicio}`).getTime();
  return horarioAgendamentoEmMs >= horarioInicioEmMs && horarioAgendamentoEmMs < horarioFimEmMs;
}

module.exports = class ControladorDeAgendamentos {
  static async criarAgendamento(req, res) {
    const { dataInicio, dataFim, dias, usuario, sala, horarioInicio, horarioFim } = req.body;
    console.log(req.body);
    // Verificar se todos os campos estão preenchidos
    if (!dataInicio || !dataFim || !dias || !usuario || !sala || !horarioInicio || !horarioFim) {
      return res
        .status(400)
        .json({ error: "Todos os campos devem ser preenchidos" });
    }

    // Converter o array dias em uma string separada por vírgulas
    const diasString = dias.map((dia) => `${dia}`).join(", ");
    console.log(diasString);

    // Verificar se o tempo está dentro do intervalo permitido
    const estaDentroDoIntervalo = (tempo) => {
      const [horas, minutos] = tempo.split(":").map(Number);
      const totalMinutos = horas * 60 + minutos;
      return totalMinutos >= 7.5 * 60 && totalMinutos <= 23 * 60;
    };

    // Verificar se o tempo de início e término está dentro do intervalo permitido
    if (!estaDentroDoIntervalo(horarioInicio) || !estaDentroDoIntervalo(horarioFim)) {
      return res.status(400).json({
        error: "A sala de aula só pode ser reservada dentro do intervalo de 7:30 às 23:00",
      });
    }

    try {
      const consultaSobreposicao = `
    SELECT * FROM agendamento
    WHERE 
        sala = '${sala}'
        AND (
            (dataInicio <= '${dataFim}' AND dataFim >= '${dataInicio}')
        )
        AND (
            (horarioInicio <= '${horarioFim}' AND horarioFim >= '${horarioInicio}')
        )
        AND (
            (dias LIKE '%Seg%' AND '${diasString}' LIKE '%Seg%') OR
            (dias LIKE '%Ter%' AND '${diasString}' LIKE '%Ter%') OR
            (dias LIKE '%Qua%' AND '${diasString}' LIKE '%Qua%') OR 
            (dias LIKE '%Qui%' AND '${diasString}' LIKE '%Qui%') OR
            (dias LIKE '%Sex%' AND '${diasString}' LIKE '%Sex%') OR
            (dias LIKE '%Sab%' AND '${diasString}' LIKE '%Sab%')
        )`;

      conectar.query(consultaSobreposicao, function (erro, resultados) {
        if (erro) {
          console.log(erro);
          return res
            .status(500)
            .json({ error: "Erro ao verificar agendamento existente" });
        }

        // Se a consulta retornar algum resultado, significa que já existe um agendamento
        if (resultados.length > 0) {
          return res.status(400).json({
            error: "Já existe um agendamento para os mesmos dias, sala e horários",
          });
        }

        // Caso contrário, prossegue com a inserção na tabela
        const consultaInsercao = `
                INSERT INTO agendamento (dataInicio, dataFim, dias, usuario, sala, horarioInicio, horarioFim)
                VALUES (
                    '${dataInicio}',
                    '${dataFim}',
                    '${diasString}',
                    '${usuario}',
                    '${sala}',
                    '${horarioInicio}',
                    '${horarioFim}'
                )
            `;

        // Executa a consulta de inserção
        conectar.query(consultaInsercao, function (erro) {
          if (erro) {
            console.log(erro);
            return res
              .status(500)
              .json({ error: "Erro ao cadastrar agendamento" });
          }
          console.log("Agendamento cadastrado com sucesso");
          return res
            .status(201)
            .json({ message: "Agendamento cadastrado com sucesso" });
        });
      });
    } catch (erro) {
      console.error("Erro ao executar a consulta:", erro);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async obterAgendamentosPorIdSalaIntervalos(req, res) {
    const idSala = req.params.id;
    const { inicioSemana, fimSemana } = req.query; // Variável para armazenar a semana selecionada
    console.log(inicioSemana + ' ' + fimSemana)
    // Consulta SQL para obter todos os agendamentos para uma determinada sala de aula
    const consulta = `
    SELECT agendamento.*, usuario.nome AS nomeUsuario
    FROM agendamento
    JOIN usuario ON agendamento.usuario = usuario.cpf
    WHERE sala = '${idSala}'
    AND (dataInicio <= '${fimSemana}' AND dataFim >= '${inicioSemana}')
`;

    try {
      // Executa a consulta
      conectar.query(consulta, function (erro, resultados) {
        if (erro) {
          console.error(erro);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        // Objeto para armazenar os agendamentos organizados por dia da semana e intervalo de horário
        const agendamentosPorDiaEIntervalo = {
          Seg: {
            "07:30 - 09:30": [],
            "09:30 - 11:30": [],
            "12:30 - 15:30": [],
            "15:30 - 17:30": [],
            "19:00 - 22:00": [],
          },
          Ter: {
            "07:30 - 09:30": [],
            "09:30 - 11:30": [],
            "12:30 - 15:30": [],
            "15:30 - 17:30": [],
            "19:00 - 22:00": [],
          },
          Qua: {
            "07:30 - 09:30": [],
            "09:30 - 11:30": [],
            "12:30 - 15:30": [],
            "15:30 - 17:30": [],
            "19:00 - 22:00": [],
          },
          Qui: {
            "07:30 - 09:30": [],
            "09:30 - 11:30": [],
            "12:30 - 15:30": [],
            "15:30 - 17:30": [],
            "19:00 - 22:00": [],
          },
          Sex: {
            "07:30 - 09:30": [],
            "09:30 - 11:30": [],
            "12:30 - 15:30": [],
            "15:30 - 17:30": [],
            "19:00 - 22:00": [],
          },
          Sab: {
            "07:30 - 09:30": [],
            "09:30 - 11:30": [],
            "12:30 - 15:30": [],
            "15:30 - 17:30": [],
            "19:00 - 22:00": [],
          },
        };

        // Organiza os agendamentos pelos dias da semana e intervalo de horário
        resultados.forEach((agendamento) => {
          const dias = agendamento.dias.split(", ");
          const intervalosDeTempo = [
            "07:30 - 09:30",
            "09:30 - 11:30",
            "12:30 - 15:30",
            "15:30 - 17:30",
            "19:00 - 22:00",
          ];
          dias.forEach((dia) => {
            intervalosDeTempo.forEach((intervalo) => {
              if (estaNoIntervaloDeTempo(agendamento.horarioInicio, intervalo)) {
                agendamentosPorDiaEIntervalo[dia][intervalo].push(agendamento);
              }
            });
          });
        });

        // Ordena os agendamentos dentro de cada lista com base no horarioInicio
        Object.keys(agendamentosPorDiaEIntervalo).forEach((dia) => {
          Object.keys(agendamentosPorDiaEIntervalo[dia]).forEach((intervalo) => {
            agendamentosPorDiaEIntervalo[dia][intervalo].sort((a, b) => {
              const horarioInicioA = new Date(`1970-01-01T${a.horarioInicio}`);
              const horarioInicioB = new Date(`1970-01-01T${b.horarioInicio}`);
              return horarioInicioA - horarioInicioB;
            });
          });
        });

        // Retorna os agendamentos organizados por dia da semana e intervalo de horário
        return res.status(200).json({ agendamentosPorDiaEIntervalo });
      });
    } catch (erro) {
      console.error("Erro ao executar a consulta:", erro);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async obterAgendamentosPorIdSala(req, res) {
    const idSala = req.params.id;

    // Consulta SQL para obter todos os agendamentos para uma determinada sala de aula
    const consulta = `
  SELECT agendamento.*, usuario.nome AS nomeUsuario
  FROM agendamento
  JOIN usuario ON agendamento.usuario = usuario.cpf
  WHERE sala = '${idSala}'
`;

    try {
      conectar.query(consulta, function (erro, resultados) {
        if (erro) {
          console.error(erro);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        // Objeto para armazenar os agendamentos organizados por dia da semana
        const agendamentosPorDia = {
          Seg: [],
          Ter: [],
          Qua: [],
          Qui: [],
          Sex: [],
          Sab: [],
        };

        // Organiza os agendamentos pelos dias da semana
        resultados.forEach((agendamento) => {
          const dias = agendamento.dias.split(", ");
          dias.forEach((dia) => {
            agendamentosPorDia[dia].push(agendamento);
          });
        });

        // Ordena os agendamentos dentro de cada lista com base no horarioInicio
        Object.keys(agendamentosPorDia).forEach((dia) => {
          agendamentosPorDia[dia].sort((a, b) => {
            const horarioInicioA = new Date(`1970-01-01T${a.horarioInicio}`);
            const horarioInicioB = new Date(`1970-01-01T${b.horarioInicio}`);
            return horarioInicioA - horarioInicioB;
          });
        });

        // Retorna os agendamentos organizados por dia da semana e ordenados por horarioInicio
        return res.status(200).json({ agendamentosPorDia });
      });
    } catch (erro) {
      console.error("Erro ao executar a consulta:", erro);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async obterTodosOsAgendamentos(req, res) {
    try {
      // Consulta SQL para obter todos os agendamentos
      const consulta = `
      SELECT agendamento.*, usuario.nome AS nomeUsuario
      FROM agendamento
      JOIN usuario ON agendamento.usuario = usuario.cpf
    `;

      conectar.query(consulta, function (erro, resultados) {
        if (erro) {
          console.error(erro);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }

        // Objeto para armazenar os agendamentos organizados por dia da semana
        const agendamentosPorDia = {
          Seg: [],
          Ter: [],
          Qua: [],
          Qui: [],
          Sex: [],
          Sab: [],
        };

        // Organiza os agendamentos pelos dias da semana
        resultados.forEach((agendamento) => {
          const dias = agendamento.dias.split(", ");
          dias.forEach((dia) => {
            agendamentosPorDia[dia].push(agendamento);
          });
        });

        // Ordena os agendamentos dentro de cada lista com base no horarioInicio
        Object.keys(agendamentosPorDia).forEach((dia) => {
          agendamentosPorDia[dia].sort((a, b) => {
            const horarioInicioA = new Date(`1970-01-01T${a.horarioInicio}`);
            const horarioInicioB = new Date(`1970-01-01T${b.horarioInicio}`);
            return horarioInicioA - horarioInicioB;
          });
        });

        // Retorna os agendamentos organizados por dia da semana e ordenados por horarioInicio
        return res.status(200).json({ agendamentosPorDia });
      });
    } catch (erro) {
      console.error("Erro ao executar a consulta:", erro);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  static async excluirAgendamento(req, res) {
    const idAgendamento = req.params.id;
    const consulta = `DELETE FROM agendamento WHERE id = ${idAgendamento}`;

    try {
      conectar.query(consulta, function (erro) {
        if (erro) {
          console.error(erro);
          return res.status(500).json({ error: "Erro ao excluir agendamento" });
        }
        return res.status(200).json({ message: "Agendamento excluído com sucesso" });
      });
    } catch (erro) {
      console.error("Erro ao executar a consulta:", erro);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
};
