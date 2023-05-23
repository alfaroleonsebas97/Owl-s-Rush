import Player from './Player.js';

// Datos que vienen del Lobby
const numberOfPlayers = 4;
const numMaxPlayers = 4;

const sunElement = document.getElementById('sun');

// Mensaje para el host del lobby (EXIT GAME dentro de GameScreen)
document.getElementsByClassName('exit_game_button')[0].addEventListener('click', () => {
  if (window.confirm('Exit game will close the lobby.' // eslint-disable-line no-alert
  + '\n\nAre you sure you want to exit game?')) {
    window.location.replace('../xhtml/HomeScreen.xhtml');
  }
});

document.getElementsByClassName('exit_game_button')[1].addEventListener('click', () => {
  if (window.confirm('Exit game will close the lobby.' // eslint-disable-line no-alert
  + '\n\nAre you sure you want to exit game?')) {
    window.location.replace('../xhtml/HomeScreen.xhtml');
  }
});

// Mensaje para el host del lobby (RETURN TO LOBBY dentro de GameScreen)
document.getElementById('return_to_lobby_play_button').addEventListener('click', () => {
  if (window.confirm('Return to lobby will finish the current game.' // eslint-disable-line no-alert
  + '\n\nAre you sure you want to return to lobby?')) {
    window.location.replace('../xhtml/LobbyScreen.xhtml');
  }
});

class Game {
  constructor() {
    this.players = [];
  }

  setupEvents() {
    this.displayCredits();

    for (let i = 0; i < numMaxPlayers; i += 1) {
      if (i < numberOfPlayers) {
        this.players[i] = new Player(`${i + 1}`);
        this.players[i].setOwls();
        this.players[i].setCards();

        // Estas tres solo se deben hacer para mi ID
        // if (i === myPlayerId) {
          this.players[i].selectOwl();
          this.players[i].selectCard();
          this.players[i].getCard();
        // }
      } else {
        this.removeTheNoPlayer(i + 1);
      }
      this.players[0].startTurn();
    }

    sunElement.style.bottom = '0px';
  }

  displayCredits() {
    // Obtiene el modal
    const modal = document.getElementById('credits_modal');

    // Obtiene el link que abre el modal
    const btn = document.getElementById('credits_button');

    // Abre el modal con un clic en el link.
    btn.onclick = () => {
      modal.style.display = 'flex';
    };

    // Cierra el modal con un clic en el cualquier parte de la ventana fuera del modal.
    window.onclick = (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    };
  }

  // Elimina los campos del reloj, nombre y cartas del jugador `player${i + 1}`,
  // respectivamente. También borra las imágenes de los búhos de este jugador.
  removeTheNoPlayer(playerNumber) {
    const clockDiv = document.getElementById(`div_hourglass_player${playerNumber}`);
    if (clockDiv) {
      clockDiv.parentNode.removeChild(clockDiv);
    }

    const nameDiv = document.getElementById(`div_name_player${playerNumber}`);
    if (nameDiv) {
      nameDiv.parentNode.removeChild(nameDiv);
    }

    const cardsDiv = document.getElementById(`div_cards_player${playerNumber}`);
    if (cardsDiv) {
      cardsDiv.parentNode.removeChild(cardsDiv);
    }
  }
}

function main() {
  const game = new Game();
  game.setupEvents();
}

window.addEventListener('load', main);
