-- Cadastrar um novo usuário ---------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE sp_cadastrar_usuario (
    IN p_nome VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_cpf CHAR(14),
    IN p_senha VARCHAR(30)
)
BEGIN
    INSERT INTO usuario (nome, email, cpf, senha)
    VALUES (p_nome, p_email, p_cpf, p_senha);
END$$

DELIMITER ;

CALL sp_cadastrar_usuario('João da Silva', 'joao@email.com', '123.456.789-00', 'senha123');


-- Listar todas as salas  -------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE sp_listar_salas()
BEGIN
    SELECT * FROM sala;
END$$

DELIMITER ;

-- Reservar uma sala -----------------------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE sp_reservar_sala (
    IN p_id_usuario INT,
    IN p_id_sala INT,
    IN p_inicio DATETIME,
    IN p_fim DATETIME
)
BEGIN
    INSERT INTO reserva (fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim)
    VALUES (p_id_usuario, p_id_sala, p_inicio, p_fim);
END$$

DELIMITER ;

-- Verificar reservas de um usuário --------------------------------------------------------

DELIMITER $$

CREATE PROCEDURE sp_reservas_por_usuario (
    IN p_id_usuario INT
)
BEGIN
    SELECT r.id_reserva, s.classificacao, r.datahora_inicio, r.datahora_fim
    FROM reserva r
    JOIN sala s ON r.fk_id_sala = s.id_sala
    WHERE r.fk_id_usuario = p_id_usuario;
END$$

DELIMITER ;

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

-----------------------------------------------------------------------------------------
Opção 2: Criar um procedure que já faz a verificação e só insere se não houver conflito

DELIMITER $$

CREATE PROCEDURE sp_reservar_sala_segura (
    IN p_id_usuario INT,
    IN p_id_sala INT,
    IN p_inicio DATETIME,
    IN p_fim DATETIME
)
BEGIN
    DECLARE conflitos INT;

    SELECT COUNT(*) INTO conflitos
    FROM reserva
    WHERE fk_id_sala = p_id_sala
      AND (
        datahora_inicio < p_fim AND datahora_fim > p_inicio
      );

    IF conflitos = 0 THEN
        INSERT INTO reserva (fk_id_usuario, fk_id_sala, datahora_inicio, datahora_fim)
        VALUES (p_id_usuario, p_id_sala, p_inicio, p_fim);
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Sala já reservada nesse horário.';
    END IF;
END$$

DELIMITER ;





