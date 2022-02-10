const pokedex = document.getElementById('pokedex');
let num = 1;
const next_button = document.getElementById("next-button");
const prev_button = document.getElementById("prev-button");
const pokeBtn = document.getElementById("poke-card");

// Fetch the Arduino

const getXAxis = () => {
    state.joystick.x;
    state.joystick.pressed;
  }

const requestPortButton = document.querySelector("#request-port-access");
requestPortButton.addEventListener("pointerdown", async (event) => {
  // First, request port access, which hopefully leads to a connection
  const port = await navigator.serial.requestPort(); 
  state.serial = port;

  await state.serial.open({ baudRate: 9600 }); 
  
  await readJSONFromArduino("joystick", getXAxis);
});

const readJSONFromArduino = async (propertyName, callback) => {
    if (!state.serial) throw new Error("No Arduino connected to read the data from!");
  
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = state.serial.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    let lineBuffer = "";
  
    // Listen to data coming from the serial device.
    while (true) {
      const response = await reader.read();
  
      if (response.done) {
        reader.releaseLock();
        break;
      }
  
      lineBuffer += response.value;
      const lines = lineBuffer.split("\n");
      if (lines.length > 1) {
        lineBuffer = lines.pop();
        const line = lines.pop().trim();
        const json = JSON.parse(line);
        state[propertyName] = json;
        callback(json);
        movePkm();
        morePkm();
      }
    }
    
  }

const state = {
    serial: null,
    joystick: {
      x: 0,
      pressed: false,
    }
  };
// Fetch the Pokemon API
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

pokeBtn.addEventListener("click", () => {
    fetchMore();
})

let haveMoved = false;

const addButton = document.querySelector("#add-button")


const morePkm =  () => {
    if(state.joystick.pressed === true){
        fetchMore();
    }
}

const movePkm = () => {
    if (state.joystick.x < 8) {
        if (!haveMoved) {
            num++;
            fetchPokemon();
            haveMoved = true;
    }
    } else if (state.joystick.x > 1020) {
        if (!haveMoved) {
            num--;
            fetchPokemon();
            haveMoved = true;
        }
    } else {
        haveMoved = false;
    }
}


fetchPokemon();

/*
next_button.addEventListener("click", () => {
    if (num < 898) {
        num++;
        console.log("Pokemon Number: " + num);
        fetchPokemon();
    }
})

prev_button.addEventListener("click", () => {
    if (num > 1)
        num--;
    console.log("Pokemon Number: " + num);
    fetchPokemon();
})
*/




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