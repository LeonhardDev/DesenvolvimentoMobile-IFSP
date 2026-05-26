// Interfaces para tipar o retorno da API
interface PokemonType {
    type: {
      name: string;
    };
  }
  
  interface PokemonData {
    name: string;
    height: number;
    weight: number;
    types: PokemonType[];
  }
  
  const buscarPokemon = async () => {
    // Pega o terceiro argumento do terminal
    const argumento = process.argv[2];
  
    if (!argumento) {
      console.log("⚠️ Por favor, informe o nome ou ID de um Pokémon.");
      return;
    }
  
    const idOuNome = argumento.toLowerCase();
    const url = `https://pokeapi.co/api/v2/pokemon/${idOuNome}`;
  
    try {
      const resposta = await fetch(url);
  
      // Tratamento 404
      if (!resposta.ok) {
        if (resposta.status === 404) {
          console.log("❌ Pokémon não encontrado!");
        } else {
          console.log("⚠️ Erro na requisição. Código:", resposta.status);
        }
        return;
      }
  
      const dados = (await resposta.json()) as PokemonData;
  
      // Formatando os dados
      const nome = dados.name.charAt(0).toUpperCase() + dados.name.slice(1);
      const altura = dados.height / 10; // Converte de decímetros para metros
      const peso = dados.weight / 10; // Converte de hectogramas para kg
      
      // Mapeia os tipos e coloca a primeira letra maiúscula
      const tipos = dados.types
        .map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
        .join(", ");
  
      // Saída final no terminal
      console.log(`${nome} - ${altura} m - ${peso} kg - ${tipos}`);
    } catch (erro) {
      // Tratamento de erro de rede
      console.log("⚠️ Erro de rede. Tente novamente.");
    }
  };
  
  // Executa a função assíncrona
  buscarPokemon();