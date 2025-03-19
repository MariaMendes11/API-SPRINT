module.exports = function validateSalas({
    fk_id_usuario,
    fk_id_sala,
    datahora_inicio,
    datahora_fim
  }) {
    // Valida se todos os campos obrigatórios foram preenchidos
    if (!fk_id_usuario || !fk_id_sala || !datahora_inicio || !datahora_fim) {
        return res
          .status(400)
          .json({ error: "Todos os campos devem ser preenchidos" });
      }

      //Valida se o campo tem 'A' 'B' 'C' 'D'
    if (bloco !== "A" && bloco !== "B" && bloco !== "C" && bloco !== "D") {
        return res.status(400).json({
          error: "Valores inválidos, para blocos digite 'A', 'B', 'C', 'D'",
        });
      }

        // Verifica se as datas estão em um formato válido
         const inicio = new Date(datahora_inicio);
         const fim = new Date(datahora_fim);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    return { error: "Data e hora devem estar em um formato válido" };
         }

         //Verifica se o harario da reserva esta entre 07:00 as 21:00
        const inicioHora = moment(datahora_inicio).tz("America/Sao_Paulo").hour();
            const fimHora = moment(datahora_fim).tz("America/Sao_Paulo").hour();
        
            if (inicioHora < 7 || fimHora > 21 || fimHora < 7 || inicioHora > 21) {
              return res
                .status(400)
                .json({ error: "Reservas só podem ser feitas entre 07:00 e 21:00." });
            }

        // Define o limite de tempo de reserva para 1 hora
        const limiteHora = 60 * 60 * 1000; // 1 hora em milissegundos
        if (new Date(datahora_fim) - new Date(datahora_inicio) > limiteHora) {
          return res
            .status(400)
            .json({ error: "O tempo de reserva excede o limite (1h)" });
        }
        // Valida se a data de fim é maior que a data de início
         if (
        new Date(datahora_fim).getTime() <
        new Date(datahora_inicio).getTime()
            ) {
        return res.status(400).json({ error: "Data ou Hora inválida" });
         }
            // Verifica se a sala já está reservada para o horário solicitado
         if (resultadosH.length > 0) {
         return res.status(400).json({
             error: "A sala escolhida já está reservada neste horário",
             });
        }
  
    return null; // Retorna null se não houver erro
  };