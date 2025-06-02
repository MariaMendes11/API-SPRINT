DELIMITER //

CREATE PROCEDURE reservas_ativas_por_usuario(
    IN p_id_usuario INT
)
BEGIN
    SELECT 
        r.id_reserva,
        s.classificacao AS nome_sala,
        r.datahora_inicio
    FROM reserva r
    JOIN sala s ON r.fk_id_sala = s.id_sala
    WHERE r.fk_id_usuario = p_id_usuario
      AND r.datahora_inicio > NOW()
    ORDER BY r.datahora_inicio;
END;
//

DELIMITER ;

--Mostrar todas as reservas futuras do usuário com ID
CALL reservas_ativas_por_usuario(3);


