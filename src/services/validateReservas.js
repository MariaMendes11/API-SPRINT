const moment = require("moment-timezone");


module.exports = async function validateSalas({
  fk_id_usuario,
  fk_id_sala,
  datahora_inicio,
  datahora_fim,
}) {
  // Valida se todos os campos obrigatórios foram preenchidos
  if (!fk_id_usuario || !fk_id_sala || !datahora_inicio || !datahora_fim) {
    return { error: "Todos os campos devem ser preenchidos" };
  }

  // Verifica se as datas estão em um formato válido
  const inicio = moment(datahora_inicio, moment.ISO_8601, true);
  const fim = moment(datahora_fim, moment.ISO_8601, true);

  if (!inicio.isValid() || !fim.isValid()) {
    return { error: "Data e hora devem estar em um formato válido" };
  }

  // Verifica se o horário da reserva está entre 07:00 e 21:00
  const inicioHora = inicio.tz("America/Sao_Paulo").hour();
  const fimHora = fim.tz("America/Sao_Paulo").hour();

  if (inicioHora < 7 || fimHora > 17 || fimHora < 7 || inicioHora > 17) {
    return { error: "Reservas só podem ser feitas entre 07:00 e 17:00." };
  }

  // Define o limite de tempo de reserva para 1 hora
  const limiteHora = 60 * 60 * 1000; // 1 hora em milissegundos
  if (fim.diff(inicio) > limiteHora) {
    return { error: "O tempo de reserva excede o limite (1h)" };
  }

  // Valida se a data de fim é maior que a data de início
  if (fim.isBefore(inicio)) {
    return { error: "Data ou Hora inválida" };
  }

  // // Verifica se o usuário foi encontrado
  // if (resultadosU.length === 0) {
  //   return { error: "Usuário não encontrado" };
  // }

  // // Verifica se a sala foi encontrada
  // if (resultadosS.length === 0) {
  //   return { error: "Sala não encontrada" };
  // }

  // // Verifica se a sala já está reservada para o horário solicitado
  // if (resultadosH.length > 0) {    
  //   return { error: "A sala escolhida já está reservada neste horário!"};    
  // }

  return null; // Retorna null se não houver erro
};
