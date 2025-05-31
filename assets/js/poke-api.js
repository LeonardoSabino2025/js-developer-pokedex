const pokeApi = {};

function getGenderString(genderRate) {
  if (genderRate === -1) {
    return "Genderless";
  } else if (genderRate === 0) {
    return "100% Male";
  } else if (genderRate === 8) {
    return "100% Female";
  } else {
    const femalePercentage = (genderRate / 8) * 100;
    const malePercentage = 100 - femalePercentage;
    return `${malePercentage}% Male, ${femalePercentage}% Female`;
  }
}

async function getTypeStrengthsAndWeaknesses(mainType) {
  if (!mainType) return { weaknesses: [], strengths: [] };

  const typeData = await fetch(
    `https://pokeapi.co/api/v2/type/${mainType}/`
  ).then((response) => response.json());

  const weaknesses = typeData.damage_relations.double_damage_from.map(
    (relation) => relation.name
  );
  const strengths = typeData.damage_relations.double_damage_to.map(
    (relation) => relation.name
  );

  return { weaknesses, strengths };
}

function convertPokeApiDetailToPokemon(
  pokemonDetail,
  speciesDetail,
  typeRelations
) {
  const pokemon = new Pokemon();
  pokemon.number = pokemonDetail.id;
  pokemon.name = pokemonDetail.name;

  const mainTypeObject = pokemonDetail.types.find(
    (typeSlot) => typeSlot.slot === 1
  );
  pokemon.mainType = mainTypeObject ? mainTypeObject.type.name : "";

  pokemon.types = pokemonDetail.types.map((typeSlot) => typeSlot.type.name);

  pokemon.image =
    pokemonDetail.sprites.other.dream_world.front_default ||
    pokemonDetail.sprites.front_default;

  pokemon.height = pokemonDetail.height / 10;
  pokemon.weight = pokemonDetail.weight / 10;
  pokemon.gender = getGenderString(speciesDetail.gender_rate);

  pokemon.stats = pokemonDetail.stats.map((statSlot) => ({
    name: statSlot.stat.name,
    base_stat: statSlot.base_stat,
  }));

  pokemon.abilities = pokemonDetail.abilities.map(
    (abilitySlot) => abilitySlot.ability.name
  );

  pokemon.weaknesses = typeRelations.weaknesses;
  pokemon.strengths = typeRelations.strengths;

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
  const pokemonUrl = pokemon.url;

  const detailFetch = fetch(pokemonUrl).then((response) => response.json());

  return detailFetch.then((pokemonDetail) => {
    const speciesFetch = fetch(pokemonDetail.species.url).then((response) =>
      response.json()
    );

    const mainType = pokemonDetail.types.find((typeSlot) => typeSlot.slot === 1)
      ?.type.name;
    const typeRelationsFetch = getTypeStrengthsAndWeaknesses(mainType);

    return Promise.all([
      Promise.resolve(pokemonDetail),
      speciesFetch,
      typeRelationsFetch,
    ]).then(([detail, species, typeRelations]) =>
      convertPokeApiDetailToPokemon(detail, species, typeRelations)
    );
  });
};

pokeApi.getPokemonDetailById = (idOrName) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${idOrName}/`;

  const detailFetch = fetch(url).then((response) => response.json());

  return detailFetch.then((pokemonDetail) => {
    const speciesFetch = fetch(pokemonDetail.species.url).then((response) =>
      response.json()
    );

    const mainType = pokemonDetail.types.find((typeSlot) => typeSlot.slot === 1)
      ?.type.name;
    const typeRelationsFetch = getTypeStrengthsAndWeaknesses(mainType);

    return Promise.all([
      Promise.resolve(pokemonDetail),
      speciesFetch,
      typeRelationsFetch,
    ]).then(([detail, species, typeRelations]) =>
      convertPokeApiDetailToPokemon(detail, species, typeRelations)
    );
  });
};
