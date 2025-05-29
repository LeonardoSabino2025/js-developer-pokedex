const pokeApi = {};

function convertPokeApiDetailToPokemon(pokemonDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokemonDetail.order;
  pokemon.name = pokemonDetail.name;

  const mainTypeObject = pokemonDetail.types.find(
    (typeSlot) => typeSlot.slot === 1
  );
  pokemon.mainType = mainTypeObject ? mainTypeObject.type.name : "";

  pokemon.types = pokemonDetail.types.map((typeSlot) => typeSlot.type.name);

  pokemon.image = pokemonDetail.sprites.other.dream_world.front_default;

  return pokemon;
}

pokeApi.getPokemons = (offset = 0, limit = 10) => {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) =>
      pokemons.map((pokemon) => pokeApi.getPokemonDetail(pokemon))
    )
    .then((detailRequests) => Promise.all(detailRequests))
    .then((pokemonsDetails) => pokemonsDetails)
    .catch((error) => console.error(error));
};

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};
