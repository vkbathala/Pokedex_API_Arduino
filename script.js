const pokedex = document.getElementById('pokedex');
let num = 1;
const next_button = document.getElementById("next-button");
const prev_button = document.getElementById("prev-button");
const pokeBtn = document.getElementById("poke-card");

const fetchPokemon = () => {
    let promises = [];
    const url = `https://pokeapi.co/api/v2/pokemon/${num}`;
    promises.push(fetch(url).then((res) => res.json()));
    Promise.all(promises).then((results) => {
        let pokemon = results.map((result) => ({
            name: result.name,
            image: result.sprites['front_default'],
            type: result.types.map((type) => type.type.name).join(', '),
            id: result.id
        }));
        displayPokemon(pokemon);
    });
};

const fetchMore = () => {
    let promises = [];
    const url = `https://pokeapi.co/api/v2/pokemon/${num}`;
    promises.push(fetch(url).then((res) => res.json()));
    Promise.all(promises).then((results) => {
        let pokemon = results.map((result) => ({
            name: result.name,
            image: result.sprites['front_default'],
            type: result.types.map((type) => type.type.name).join(', '),
            id: result.id,
            weight: result.weight
        }));
        displayMore(pokemon);
    });
}

const displayPokemon = (pokemon) => {
    const pokemonHTMLString = pokemon
        .map(
            (pokemon) => `
        <li class="card">
            <img class="card-image" src="${pokemon.image}"/>
            <h2 class="card-title">#${pokemon.id} ${pokemon.name}</h2>
            <p class="card-subtitle">Type: ${pokemon.type}</p>
        </li>
    `
        )
        .join('');
    pokedex.innerHTML = pokemonHTMLString;
};

const displayMore = (pokemon) => {
    const pokemonHTMLString = pokemon
        .map(
            (pokemon) => `
        <li class="card">
            <img class="card-image" src="${pokemon.image}"/>
            <h2 class="card-title">#${pokemon.id} ${pokemon.name}</h2>
            <p class="card-subtitle">Type: ${pokemon.type}</p>
            <p class="card-subtitle">Weight: ${pokemon.weight}</p>
        </li>
    `
        )
        .join('');
    pokedex.innerHTML = pokemonHTMLString;
}

pokeBtn.addEventListener("click", ()=> {
    fetchMore();
})

next_button.addEventListener("click", ()=> {
    if (num < 898) {
        num++;
        console.log("Pokemon Number: " + num);
        fetchPokemon();
    }
})

prev_button.addEventListener("click", ()=> {
    if (num > 1)
        num--;
    console.log("Pokemon Number: " + num);
    fetchPokemon();
})

fetchPokemon();



/*const fetchPokemon = () => {
    const promises = [];
    for (let i = 1; i <= 898; i++) {
        const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
        promises.push(fetch(url).then((res) => res.json()));
    }
    Promise.all(promises).then((results) => {
        const pokemon = results.map((result) => ({
            name: result.name,
            image: result.sprites['front_default'],
            type: result.types.map((type) => type.type.name).join(', '),
            id: result.id
        }));
        displayPokemon(pokemon);
    });
};*/