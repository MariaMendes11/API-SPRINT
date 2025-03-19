module.exports = function validateSalas({
    horarios_disponiveis,
    classificacao,
    bloco
  }) {
    if (!horarios_disponiveis || !classificacao || !bloco) {
        return res
          .status(400)
          .json({ error: "Todos os campos devem ser preenchidos" });
      }
      if (bloco !== "A" && bloco !== "B" && bloco !== "C" && bloco !== "D") {
        return res.status(400).json({
          error: "Valores inválidos, para blocos digite 'A', 'B', 'C', 'D'",
        });
      }
      
    return null; // Retorna null se não houver erro
  };
  
  