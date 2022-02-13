const pokedex = document.getElementById('pokedex'); // The html list element containing the pokemon
let num = 1; // variable that keeps track of the pokemon number we are on
const pokeBtn = document.getElementById("poke-card"); // creates a variable for the card containing the pkmn

// Fetch the Arduino

const getXAxis = () => {
    state.joystick.x; // deals with the joystick'c current x-axis orientation
    state.joystick.pressed; // deals with joystick's current pressed/not pressed status
}

const requestPortButton = document.querySelector("#request-port-access"); // Variable for our request port access button
requestPortButton.addEventListener("pointerdown", async (event) => { //checks if request port button pressed
    // First, request port access, which hopefully leads to a connection
    const port = await navigator.serial.requestPort(); // requests port access
    state.serial = port;

    await state.serial.open({ baudRate: 9600 }); // determines speed of communication over data channel

    await readJSONFromArduino("joystick", async (json) => { // readJSONFromArduino method
        movePkm(); // calls movePkm method
        morePkm(); //calls morePkm method
        writeJSONToArduino("dataToWrite"); // calls writeJSONToArduino method
    });

});

const readJSONFromArduino = async (propertyName, callback) => { // readJSONFromArduino method
    if (!state.serial) throw new Error("No Arduino connected to read the data from!"); // throws error if no Arduino connected

    const textDecoder = new TextDecoderStream(); // TextDecoderStream converts a stream of strings into bytes in the UTF-8 encoding
    const reader = textDecoder.readable.getReader(); // instantiates a reader for the textDecoder
    let lineBuffer = ""; // simple line buffer

    // Listen to data coming from the serial device.
    while (true) { // while true
        const response = await reader.read(); // response is assigned the value of the reader.read

        if (response.done) { // if the response is done
            reader.releaseLock(); // release it
            break; // exit the while loop
        }

        lineBuffer += response.value; // response.value is added to the lineBuffer
        const lines = lineBuffer.split("\n"); // \n creates a new line
        if (lines.length > 1) { // if the line length is greater than 1
            lineBuffer = lines.pop(); //removes last element
            const line = lines.pop().trim(); // removes whitespace
            const json = JSON.parse(line); // parses a json string
            state[propertyName] = json; // the value of the array portion is set to the json
            callback(json); // calls callback method

        }
    }

}



const state = { // instantiates state
    dataToWrite: {
      brightness: 0, // sets brightness to zero
    },
    serial: null, // sets serial to null
    joystick: {
      x: 0, //sets x value to 0
      pressed: false, //sets pressed status to false
    },
    writing: false, // sets writing to false
  }

// Fetch the Pokemon API

const pkmWeight = async () => { // creates an asynchronous method called pkmWeight
    fetch(`https://pokeapi.co/api/v2/pokemon/${num}`).then((response) => response.json()) //fetches json from the url
    .then((result) => {
        setLEDToPkmWeight(result.weight); // calls setLEDtoPkmWeight method with the the weight data from result json
    });
}

const fetchPokemon = () => { // instantiates new method called fetchPokemon
    let promises = []; // instantiates array
    const url = `https://pokeapi.co/api/v2/pokemon/${num}`; // accesses the url for the specific pokemon number
    promises.push(fetch(url).then((res) => res.json())); // fetches json data from url
    Promise.all(promises).then((results) => { // takes an iterable of promises as an input, and returns a
                                                        // single Promise that resolves to an array of the results of
                                                        // the input promises
        let pokemon = results.map((result) => ({ //maps data from results
            name: result.name, // name variable to result.name
            image: result.sprites['front_default'], // image variable to result.sprites
            type: result.types.map((type) => type.type.name).join(', '), // type variable to result.types
            id: result.id // id variable to result.id
        }));
        displayPokemon(pokemon); // calls displayPokemon method
        pkmWeight(); // calls pkmWeight function
    });
};


const fetchMore = () => { // instantiates new method called fetchMore
    let promises = []; // instantiates array
    const url = `https://pokeapi.co/api/v2/pokemon/${num}`; // accesses the url for the specific pokemon number
    promises.push(fetch(url).then((res) => res.json())); // fetches json data from url
    Promise.all(promises).then((results) => { // takes an iterable of promises as an input, and returns a
                                                        // single Promise that resolves to an array of the results of
                                                        // the input promises
        let pokemon = results.map((result) => ({ //maps data from results
            name: result.name, //maps data from results
            image: result.sprites['front_default'], // image variable to result.sprites
            type: result.types.map((type) => type.type.name).join(', '), // type variable to result.types
            id: result.id, // id variable to result.id
            weight: result.weight, // weight variable to result.weight
            height: result.height, // height variable to result.height
            base_experience: result.base_experience // base_experience variable to result.base_experience
        }));
        
        displayMore(pokemon); // calls displayMore method
        pkmWeight(); // calls pkmWeight method
    });
}



const displayPokemon = (pokemon) => { // creates method displayPokemon with parameter 'pokemon'
    const pokemonHTMLString = pokemon // instantiates pokemonHTMLString
        .map( // creates a new array to populate with info
        // I dont know how to comment the next 10 lines line by line, but it basically makes a card with info about the
        // pokemon including its image, id, name, and typing.
            (pokemon) => `
        <li class="card">
            <img class="card-image" src="${pokemon.image}"/>
            <h2 class="card-title">#${pokemon.id} ${pokemon.name}</h2>
            <p class="card-subtitle">Type: ${pokemon.type}</p>
        </li>
    `
        )
        .join('');
    pokedex.innerHTML = pokemonHTMLString; // sets the HTML markup contained within the element.

};

const displayMore = (pokemon) => { // creates method displayMore with parameter 'pokemon'
    const pokemonHTMLString = pokemon // instantiates pokemonHTMLString
        .map( // creates a new array to populate with info
        // I dont know how to comment the next 10 lines line by line, but it basically makes a card with info about the
        // pokemon including its image, id, name, typing, weight, height, and base experience.
            (pokemon) => `          
        <li class="card"> 
            <img class="card-image" src="${pokemon.image}"/>
            <h2 class="card-title">#${pokemon.id} ${pokemon.name}</h2>
            <p class="card-subtitle">Type: ${pokemon.type}</p>
            <p class="card-subtitle">Weight: ${pokemon.weight}</p> 
            <p class="card-subtitle">Height: ${pokemon.height}</p>
            <p class="card-subtitle">Base Experience: ${pokemon.base_experience}</p>
  
        </li>
    `
        )
        .join('');
    pokedex.innerHTML = pokemonHTMLString; // sets the HTML markup contained within the element.
    

}

pokeBtn.addEventListener("click", () => { // Event listener for pokeBtn that activates if it is clicked
    fetchMore(); // calls fetchMore method
})

let haveMoved = false; // instantiates haveMoved variable to false

const addButton = document.querySelector("#add-button") // creates a variable for the div containing add-button


const morePkm = () => { // / instantiates morePkmn method
    if (state.joystick.pressed === true) { // if the joystick is pressed
        fetchMore(); // call the fetchMore method
    }
}

const movePkm = () => { // instantiates movePkmn method
    if (state.joystick.x < 8) { // if joystick x-axis less than 8
        if (!haveMoved) { // and if haveMoved is false
            num++; // the number that keeps track of pmkn num increases by 1
            fetchPokemon(); // the fetch pokemon method is called to bring up the pkmn corresponding w/ new number
            haveMoved = true; // haveMoved becomes true
        }
    } else if (state.joystick.x > 1020) { // else if  the joystick x axis is greater than 1020
        if (!haveMoved) { // and if haveMoved is false
            num--; // the number that keeps track of pmkn num decreases by 1
            fetchPokemon(); // the fetch pokemon method is called to bring up the pkmn corresponding w/ new number
            haveMoved = true; // haveMoved becomes true
        }
    } else { // otherwise
        haveMoved = false; // haveMoved becomes/remains false
    }
}

// LED on pkm weight
const writeJSONToArduino = async (propertyName, callback) => { // asynchronous writeJSONToArduino method
    if (!state.serial) throw new Error("No Arduino connected to write the data to!"); // throws error if Arduino not connected
    if (state.writing) return; // it is possible to send double writes, which we do not want!

    state.writing = true; //sets state.writing to true
    const data = state[propertyName]; // First, we get the object an object and turn it into JSON.
    const json = JSON.stringify(data, null, 0); // Transform our internal JS object into JSON representation, which we store as a string
    const payload = new TextEncoder().encode(json); // The serial writer will want the data in a specific format, which we can do with the TextEncoder object
    const writer = await state.serial.writable.getWriter(); // Get the writer
    await writer.write(payload); // write to it
    writer.releaseLock(); // then release it for the next write
    if (callback) callback(); // Run the callback function, if any
    state.writing = false; // set state.writing to false
} // <-----

const mapRange = (value, fromLow, fromHigh, toLow, toHigh) => { // mapRange method (value is pkmn weight)
    return toLow + (toHigh - toLow) * (value - fromLow) / (fromHigh - fromLow); // Equation for setting brightness based on pokemon weight
} // <----

const setLEDToPkmWeight = async (weight) => { // setLEDToPkmWeight method that increases brightness the heavier the pmkn
    state.dataToWrite.brightness = mapRange(weight, 0, 1500, 0, 255); // calls mapRange method
} // <-----


fetchPokemon(); // fetch Pokemons
