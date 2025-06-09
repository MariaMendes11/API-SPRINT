DELIMITER $$

CREATE TRIGGER before_delete_usuario
BEFORE DELETE ON usuario
FOR EACH ROW
BEGIN
  -- 1. Armazena os dados do usuário na tabela usuario_excluido
  INSERT INTO usuario_excluido (nome, email, cpf)
  VALUES (OLD.nome, OLD.email, OLD.cpf);

  -- 2. Exclui todas as reservas vinculadas a esse usuário
  DELETE FROM reserva WHERE id_usuario = OLD.id_usuario;
END $$

DELIMITER ;