CREATE DEFINER=`alunods`@`%` FUNCTION `total_reservas_usuario`(p_id_usuario INT) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE total INT;
    
    SELECT COUNT(*) INTO total
    FROM reserva
    WHERE fk_id_usuario = p_id_usuario;
    
    RETURN total;
END; // 