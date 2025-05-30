function convertPokemonToLi(pokemon) {
  const typesHtml = pokemon.types
    .map((typeInfo) => `<li class="type ${typeInfo}">${typeInfo}</li>`)
    .join("");

  const formattedNumber = String(pokemon.number).padStart(4, "0");

  return `<li class="pokemon ${pokemon.mainType}">
          <span class="number">#${formattedNumber}</span>
          <span class="name">${pokemon.name}</span>
          <div class="detail">
            <ol class="types">
${typesHtml}
            </ol>
            <img
              src="${pokemon.image}"
              alt="${pokemon.name}"></img>
          </div>
          
          <div class="pokeball-bg-watermark"></div>
         
        </li>
        `;
}

const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const limit = 20;
let offset = 0;
const maxRecords = 1302;

function loadPokemonItems(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    // Adiciona os novos Pokémon à lista existente
    pokemonList.innerHTML += pokemons.map(convertPokemonToLi).join("");

    // Verifica se ainda há Pokémon para carregar
    const nextOffset = offset + limit;
    if (nextOffset >= maxRecords) {
      loadMoreButton.parentElement.removeChild(loadMoreButton); // Remove o botão se não houver mais Pokémon
    } else {
      offset = nextOffset; // Atualiza o offset para a próxima carga
    }
  });
}

// Carrega os primeiros Pokémon ao iniciar a página
loadPokemonItems(offset, limit);

// Adiciona um evento de clique ao botão
loadMoreButton.addEventListener("click", () => {
  // Calcula o novo offset
  offset += limit;

  // Se o próximo offset exceder o limite máximo, ajusta o limite para pegar os restantes
  const qtdRecordsWithNextPage = offset + limit;

  if (qtdRecordsWithNextPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItems(offset, newLimit);
    loadMoreButton.parentElement.removeChild(loadMoreButton); // Remove o botão após carregar os últimos
  } else {
    loadPokemonItems(offset, limit);
  }
});

pokeApi.getPokemons().then((pokemons = []) => {
  pokemonList.innerHTML += pokemons.map(convertPokemonToLi).join("");
});
