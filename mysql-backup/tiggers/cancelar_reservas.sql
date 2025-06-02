DELIMITER //

CREATE TRIGGER trg_before_cancelar_reserva
BEFORE DELETE ON reserva
FOR EACH ROW
BEGIN
    DECLARE v_data_reserva DATE;

    -- Extrair a data da datahora_inicio
    SET v_data_reserva = DATE(OLD.datahora_inicio);

    -- Inserir os dados na tabela de reservas canceladas
    INSERT INTO reserva_cancelada (
        id_reserva,
        fk_id_usuario,
        fk_id_sala,
        data_reserva,
        created_at,
        motivo_cancelamento
    )
    VALUES (
        OLD.id_reserva,
        OLD.fk_id_usuario,
        OLD.fk_id_sala,
        v_data_reserva,
        OLD.datahora_inicio,
        OLD.motivo_cancelamento
    );
END;
//

DELIMITER ;


-- 1. Defina o motivo do cancelamento na linha da reserva:
UPDATE reserva
SET motivo_cancelamento = 'Não quero mais reservar neste dia'
WHERE id_reserva = 13;

-- 2. Cancele a reserva (isso dispara a trigger):
DELETE FROM reserva
WHERE id_reserva = 13;


ALTER TABLE reserva ADD COLUMN motivo_cancelamento VARCHAR(255);


SELECT * FROM reserva_cancelada WHERE id_reserva = 10;


CALL cancelar_reserva(17, 'Não quero mais reservar neste dia');
