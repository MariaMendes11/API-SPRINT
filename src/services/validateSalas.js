module.exports = function validateSalas({
  horarios_disponiveis,
  classificacao,
  bloco,
}) {
  // Verifique se o corpo da requisição está sendo recebido
  console.log("dados recebidos: ", horarios_disponiveis, classificacao, bloco); // Isso vai te ajudar a depurar e ver o que está sendo passado

  // Validando os campos
  if (!horarios_disponiveis || !classificacao || !bloco) {
    return {
      error: "Todos os campos precisam ser preenchidos!",
    };
  }

  // Validando o valor do 'bloco'
  if (bloco !== "A" && bloco !== "B" && bloco !== "C" && bloco !== "D") {
    return {
      error: "Valores inválidos, para blocos digite 'A', 'B', 'C', 'D'",
    };
  }

  return null;
};
