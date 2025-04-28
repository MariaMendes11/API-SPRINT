--  Verificar se uma sala já está reservada em um horário específico----------------------------

DELIMITER $$

CREATE PROCEDURE sp_verificar_disponibilidade (
    IN p_id_sala INT,
    IN p_inicio DATETIME,
    IN p_fim DATETIME
)
BEGIN
    SELECT COUNT(*) AS reservas_em_conflito
    FROM reserva
    WHERE fk_id_sala = p_id_sala
      AND (
        (datahora_inicio < p_fim AND datahora_fim > p_inicio)
      );
END$$

DELIMITER ;






