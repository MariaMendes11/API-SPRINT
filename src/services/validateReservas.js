const moment = require("moment-timezone");

module.exports = function validateReservas({
  fk_id_usuario = null,
  fk_id_sala = null,
  datahora_inicio,
  datahora_fim,
}) {

  // Valida os campos da data e hora foram preenchidos na atualização da reserva
  if (fk_id_usuario == null || fk_id_sala == null) {
    if (!datahora_inicio || !datahora_fim) {
      console.log("camposobrigatoriosupdate");
      return { error: "Todos os campos devem ser preenchidos" };
    }
  }

  // Valida se todos os campos obrigatórios foram preenchidos na criação da reserva
  else if (!fk_id_usuario || !fk_id_sala || !datahora_inicio || !datahora_fim) {
    console.log("camposobrigatorios");
    return { error: "Todos os campos devem ser preenchidos" };
  }

  // Verifica se as datas estão em um formato válido
  const inicio = moment(datahora_inicio, moment.ISO_8601, true);
  const fim = moment(datahora_fim, moment.ISO_8601, true);

  if (!inicio.isValid() || !fim.isValid()) {
    console.log("formatodata");
    return { error: "Data e hora devem estar em um formato válido" };
  }

  // Verifica se o horário da reserva está entre 07:00 e 21:00
  const inicioHora = inicio.tz("America/Sao_Paulo").hour();
  const fimHora = fim.tz("America/Sao_Paulo").hour();

  if (inicioHora < 7 || fimHora > 17 || fimHora < 7 || inicioHora > 17) {
    console.log("datasreservas");
    return { error: "Reservas só podem ser feitas entre 07:00 e 17:00." };
  }

  // Define o limite de tempo de reserva para 1 hora
  const limiteHora = 60 * 60 * 1000; // 1 hora em milissegundos
  if (fim.diff(inicio) > limiteHora) {
    console.log("execede1hora");
    return { error: "O tempo de reserva excede o limite (1h)" };
  }

  // Valida se a data de fim é maior que a data de início
  if (fim.isBefore(inicio)) {
    console.log("datahorainvalida");
    return { error: "Data ou Hora inválida" };
  }

  console.log("null");
  return null; // Retorna null se não houver erro
};
