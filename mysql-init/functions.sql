-- Função que retorna o número de reservas feitas por um usuário -----------------------------

DELIMITER $$

CREATE FUNCTION total_reservas_usuario(p_id_usuario INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    
    SELECT COUNT(*) INTO total
    FROM reserva
    WHERE fk_id_usuario = p_id_usuario;
    
    RETURN total;
END$$

DELIMITER ;

SHOW CREATE FUNCTION total_reservas_usuario;