cancelar_reserva
-- A procedure vai:
-- Buscar os dados da reserva pelo ID.
-- Inserir esses dados em reserva_cancelada.
-- Deletar da tabela reserva.

CREATE PROCEDURE cancelar_reserva(
    IN p_id_reserva INT,
    IN p_motivo_cancelamento VARCHAR(255)
)
BEGIN
    DECLARE v_fk_id_usuario INT;
    DECLARE v_fk_id_sala INT;
    DECLARE v_data_reserva DATE;
    DECLARE v_created_at DATETIME;

    -- Buscar os dados da reserva
    SELECT fk_id_usuario, fk_id_sala, DATE(datahora_inicio), datahora_inicio
    INTO v_fk_id_usuario, v_fk_id_sala, v_data_reserva, v_created_at
    FROM reserva
    WHERE id_reserva = p_id_reserva;

    -- Inserir na tabela de reservas canceladas (com os nomes corretos)
    INSERT INTO reserva_cancelada (
        id_reserva, fk_id_usuario, fk_id_sala, data_reserva, created_at, motivo_cancelamento
    ) VALUES (
        p_id_reserva, v_fk_id_usuario, v_fk_id_sala, v_data_reserva, v_created_at, p_motivo_cancelamento
    );

    -- Excluir a reserva original
    DELETE FROM reserva WHERE id_reserva = p_id_reserva;
END //

DELIMITER ;

CALL cancelar_reserva(16, 'Problema com a disponibilidade da sala');


