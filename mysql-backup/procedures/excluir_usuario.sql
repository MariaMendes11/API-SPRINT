DELIMITER $$

CREATE PROCEDURE excluir_usuario(IN p_id_usuario INT)
BEGIN
  DECLARE v_nome VARCHAR(100);
  DECLARE v_email VARCHAR(100);
  DECLARE v_cpf CHAR(14);

  -- Buscar dados do usuário antes de excluir
  SELECT nome, email, cpf INTO v_nome, v_email, v_cpf
  FROM usuario
  WHERE id_usuario = p_id_usuario;

  -- Inserir na tabela de histórico
  INSERT INTO usuario_excluido (nome, email, cpf)
  VALUES (v_nome, v_email, v_cpf);

  -- Excluir reservas associadas
  DELETE FROM reserva
  WHERE fk_id_usuario = p_id_usuario;

  -- Excluir o próprio usuário
  DELETE FROM usuario
  WHERE id_usuario = p_id_usuario;
END$$

DELIMITER ;
