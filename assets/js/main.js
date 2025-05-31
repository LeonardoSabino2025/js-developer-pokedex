function convertPokemonToLi(pokemon) {
  const typesHtml = pokemon.types
    .map((typeInfo) => `<li class="type ${typeInfo}">${typeInfo}</li>`)
    .join("");

  const formattedNumber = String(pokemon.number).padStart(4, "0");

  return `<li class="pokemon ${pokemon.mainType}" data-pokemon-id="${pokemon.number}">
          <span class="number">#${formattedNumber}</span>
          <span class="name">${pokemon.name}</span>
          <div class="detail">
            <ol class="types">
              ${typesHtml}
            </ol>
            <img
              src="${pokemon.image}"
              alt="${pokemon.name}">
          </div>
          <div class="pokeball-bg-watermark"></div>
        </li>`;
}

const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");

const pokemonProfileScreen = document.getElementById("pokemonProfile");
const backButton = document.getElementById("backButton");
const profilePokemonNumber = document.getElementById("profilePokemonNumber");

const profileName = pokemonProfileScreen.querySelector(".name");
const profileTypes = pokemonProfileScreen.querySelector(".types");
const profileImage = pokemonProfileScreen.querySelector(".pokemon-image");
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

const limit = 20;
let offset = 0;
const maxRecords = 1302;

function renderPokemonItems(pokemons) {
  pokemonList.innerHTML += pokemons.map(convertPokemonToLi).join("");
  addClickListenersToPokemonItems();
}

function loadPokemonItems(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    renderPokemonItems(pokemons);

    const nextOffset = offset + limit;
    if (nextOffset >= maxRecords) {
      loadMoreButton.parentElement.removeChild(loadMoreButton);
    } else {
      offset = nextOffset;
    }
  });
}

loadPokemonItems(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  const qtdRecordsWithNextPage = offset + limit;

  if (qtdRecordsWithNextPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItems(offset, newLimit);
    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItems(offset, limit);
  }
});

function addClickListenersToPokemonItems() {
  const pokemonItems = document.querySelectorAll(".pokemon");
  pokemonItems.forEach((item) => {
    if (!item.hasAttribute("data-listener-added")) {
      item.addEventListener("click", () => {
        const pokemonId = item.dataset.pokemonId;
        if (pokemonId) {
          displayPokemonProfile(pokemonId);
        }
      });
      item.setAttribute("data-listener-added", "true");
    }
  });
}

function displayPokemonProfile(pokemonId) {
  document.querySelector(".content").classList.add("hidden");
  pokemonProfileScreen.classList.remove("hidden");
  pokemonProfileScreen.classList.add("show");

  profileName.textContent = "Loading...";
  profilePokemonNumber.textContent = "";
  profileTypes.innerHTML = "";
  profileImage.src = "";
  document.getElementById("tab-about").innerHTML =
    "<p>Loading About info...</p>";
  document.getElementById("tab-base-stats").innerHTML =
    "<p>Loading Base Stats...</p>";
  document.getElementById("tab-weaknesses").innerHTML =
    "<p>Loading Tips...</p>";

  pokeApi
    .getPokemonDetailById(pokemonId)
    .then((pokemonDetail) => {
      profileName.textContent = pokemonDetail.name;
      profilePokemonNumber.textContent = `#${String(
        pokemonDetail.number
      ).padStart(4, "0")}`;
      profileImage.src = pokemonDetail.image;
      profileImage.alt = pokemonDetail.name;

      const typesHtml = pokemonDetail.types
        .map((type) => `<li class="type ${type}">${type}</li>`)
        .join("");
      profileTypes.innerHTML = typesHtml;

      const typeColor = getTypeColor(pokemonDetail.mainType);

      document.getElementById("tab-about").innerHTML = `
        <div class="info-group">
            <span class="info-label">Weight:</span>
            <span class="info-value">${pokemonDetail.weight.toFixed(
              1
            )} kg</span>
        </div>
        <div class="info-group">
            <span class="info-label">Height:</span>
            <span class="info-value">${pokemonDetail.height.toFixed(1)} m</span>
        </div>
        <div class="info-group">
            <span class="info-label">Gender:</span>
            <span class="info-value">${pokemonDetail.gender}</span>
        </div>
        <h4>Abilities:</h4>
        <ul class="abilities-list">
            ${pokemonDetail.abilities
              .map(
                (abilityName) => `<li class="ability-item">${abilityName}</li>`
              )
              .join("")}
        </ul>
      `;

      const abilityItems = document.querySelectorAll(".ability-item");
      abilityItems.forEach((item) => {
        item.style.backgroundColor = typeColor;
        item.style.color = "#fff";
      });

      const statsHtml = pokemonDetail.stats
        .map(
          (stat) => `
            <li>
              <span class="stat-name">${stat.name.replace("-", " ")}:</span>
              <span class="stat-value">${stat.base_stat}</span>
              <div class="stat-bar-container">
                <div class="stat-bar" style="width: ${Math.min(
                  stat.base_stat,
                  100
                )}%;"></div>
              </div>
            </li>
          `
        )
        .join("");
      document.getElementById("tab-base-stats").innerHTML = `
        <h3>Base Stats</h3>
        <ul class="stats-list">${statsHtml}</ul>
      `;

      const tipsTab = document.getElementById("tab-weaknesses");
      let typeRelationsHtml = "";

      if (pokemonDetail.strengths.length > 0) {
        typeRelationsHtml +=
          '<h4>Strong Against:</h4><ul class="type-effectiveness-list strengths">';
        typeRelationsHtml += pokemonDetail.strengths
          .map(
            (type) => `<li class="type-effectiveness-item ${type}">${type}</li>`
          )
          .join("");
        typeRelationsHtml += "</ul>";
      }

      if (pokemonDetail.weaknesses.length > 0) {
        typeRelationsHtml +=
          '<h4>Weak Against:</h4><ul class="type-effectiveness-list weaknesses">';
        typeRelationsHtml += pokemonDetail.weaknesses
          .map(
            (type) => `<li class="type-effectiveness-item ${type}">${type}</li>`
          )
          .join("");
        typeRelationsHtml += "</ul>";
      }

      if (typeRelationsHtml === "") {
        typeRelationsHtml =
          "<p>No specific damage relations found for the main type.</p>";
      }
      tipsTab.innerHTML = typeRelationsHtml;

      pokemonProfileScreen.querySelector(".detail-card").style.backgroundColor =
        typeColor;
      pokemonProfileScreen.querySelector(
        ".detail-header"
      ).style.backgroundColor = "transparent";
      profileImage.style.filter = `drop-shadow(2px 2px 5px ${typeColor})`;
      pokemonProfileScreen.querySelector(
        ".pokeball-bg-watermark"
      ).style.filter = `invert(1) drop-shadow(0 0 5px ${typeColor})`;

      activateTab("about");
    })
    .catch((error) => {
      console.error("Error loading Pokémon details:", error);
      profileName.textContent = "Error loading";
      profilePokemonNumber.textContent = "";
      profileTypes.innerHTML = "";
      document.getElementById("tab-about").innerHTML =
        "<p>Error loading About info.</p>";
      document.getElementById("tab-base-stats").innerHTML =
        "<p>Error loading Base Stats.</p>";
      document.getElementById("tab-weaknesses").innerHTML =
        "<p>Error loading type relations.</p>";
    });
}

function getTypeColor(type) {
  const colorMap = {
    normal: "#babbad",
    poison: "#a4599c",
    psychic: "#f667b6",
    grass: "#8bd750",
    ground: "#eecb57",
    ice: "#94f0fd",
    fire: "#fa5542",
    rock: "#cfbd73",
    dragon: "#8978fa",
    water: "#55aefe",
    bug: "#55aefe",
    dark: "#8e6956",
    fighting: "#a85545",
    ghost: "#7873d1",
    steel: "#c4c2d8",
    flying: "#79a4ff",
    electric: "#fde642",
    fairy: "#faadff",
  };
  return colorMap[type] || "#ccc";
}

function hidePokemonProfile() {
  pokemonProfileScreen.classList.remove("show");
  pokemonProfileScreen.classList.add("hidden");
  document.querySelector(".content").classList.remove("hidden");
}

backButton.addEventListener("click", hidePokemonProfile);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = button.dataset.tab;
    activateTab(targetTab);
  });
});

function activateTab(tabId) {
  tabButtons.forEach((button) => {
    if (button.dataset.tab === tabId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  tabContents.forEach((content) => {
    if (content.id === `tab-${tabId}`) {
      content.classList.remove("hidden");
    } else {
      content.classList.add("hidden");
    }
  });
}
