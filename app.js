const pokeAPIBaseUrl = 'https://pokeapi.co/api/v2/pokemon/';
const game = document.getElementById('game');
const winner = document.querySelector('.winner');
const playerOne = document.querySelector('.player-one');
const playerTwo = document.querySelector('.player-two');
let isPaused = false;
let firstPick = null;
let matches = 0;
let playerOneControl = true;
let playerTwoControl = false;
let playerOneWins = 0;
let playerTwoWins = 0;

const colors = {
	fire: '#FDDFDF',
	grass: '#DEFDE0',
	electric: '#FCF7DE',
	water: '#DEF3FD',
	ground: '#f4e7da',
	rock: '#d5d5d4',
	fairy: '#fceaff',
	poison: '#98d7a5',
	bug: '#f8d5a3',
	dragon: '#97b3e6',
	psychic: '#eaeda1',
	flying: '#F5F5F5',
	fighting: '#E6E0D4',
  dark: '#9EBCB6',
  ghost: '#C4BAB5',
  ice: '#B3BCC4',
  steel: '#B8BAB8',
	normal: '#F5F5F5'
};

const loadPokemon = async () => {
  // new Set stablish a new object without duplicate data
  const randomIds = new Set();

  // 8 is number of pokemon pairs
  // 450 is the total of API pokemons
  while(randomIds.size < 8) {
    const randomNumber = Math.ceil(Math.random() * 450);
    randomIds.add(randomNumber);
  };

  const pokemonPromises = [...randomIds].map(id => fetch(pokeAPIBaseUrl + id));
  const responses = await Promise.all(pokemonPromises);
  return await Promise.all(responses.map(res => res.json()));
};

const displayPokemons = (pokemons) => {
  // stablish a random order
  pokemons.sort(_ => Math.random() - 0.5);
  const pokemonHTML = pokemons.map(pokemon => {
    const type = pokemon.types[0].type.name || 'normal';
    const color = colors[type];
    return `
      <div class="card" onclick="clickCard(event)" data-pokename="${pokemon.name}">
        <div class="front"></div>
        <div class="back rotated" style="background-color:${color}">
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
          <h2>${pokemon.name}</h2>
        </div>
      </div>
    `
  }).join('');
  game.innerHTML = pokemonHTML;
};

const clickCard = (event) => {
  const pokemonCard = event.currentTarget;
  const [front, back] = getFrontAndBackDataCard(pokemonCard);

  // avoid to rotate more than two cards
  if(front.classList.contains('rotated') || isPaused) return;

  // change isPaused to true after second time and add data for the first pick
  isPaused = true;

  rotateCards([front, back]);
  if (!firstPick) {
    firstPick = pokemonCard;
    isPaused = false;
  } else {
    const secondPokemonName = pokemonCard.dataset.pokename;
    const firstPokemonName = firstPick.dataset.pokename;

    if (firstPokemonName != secondPokemonName) {
      const [firstFront, firstBack] = getFrontAndBackDataCard(firstPick);
      // wait 1 sec to flip off the cards if they do not match
      setTimeout(() => {
        rotateCards([front, back, firstFront, firstBack]);
        firstPick = null;
        isPaused = false;
        playerOneControl = !playerOneControl;
        playerTwoControl = !playerTwoControl;
      }, 1000);
    } else {
      matches ++;
      if (playerOneControl) {
        playerOneWins ++;
        playerOne.innerHTML = playerOneWins;
      };
      if (playerTwoControl) {
        playerTwoWins ++;
        playerTwo.innerHTML = playerTwoWins;
      };
      if (matches == 8) {
        if (playerOneWins > playerTwoWins) {
          winner.innerHTML = 'Player One wins';
        } else if (playerOneWins < playerTwoWins) {
          winner.innerHTML = 'Player Two wins';
        } else {
          winner.innerHTML = 'Empate'
        }
      }
      firstPick = null;
      isPaused = false;
    }
  }
};

const rotateCards = (cards) => {
  // valid only if the card argument is an array
  if (typeof cards != 'object' || !cards.length) return;
  cards.forEach(card => card.classList.toggle('rotated'));
};

const getFrontAndBackDataCard = (card) => {
  const front = card.querySelector('.front');
  const back = card.querySelector('.back');
  return [front, back];
};

const resetGame = () => {
  game.innerHTML = '';
  isPaused = true;
  firstPick = null;
  matches = 0;
  winner.innerHTML = '';
  playerOneControl = true;
  playerTwoControl = false;
  playerOneWins = 0;
  playerTwoWins = 0;
  playerOne.innerHTML = 0;
  playerTwo.innerHTML = 0;
  setTimeout(async () => {
    const pokemons = await loadPokemon();
    // duplicate for getting pairs
    displayPokemons([...pokemons, ...pokemons]);
    isPaused = false;
  }, 2000);
};

resetGame();
