import Player from './Player.js';

// Datos que vienen del Lobby
const numberOfPlayers = window.localStorage.getItem('numPlayers');
const numMaxPlayers = 4;

const sunElement = document.getElementById('sun');
const myPlayerId = parseInt(window.localStorage.getItem('playerId'), 10);
const sessionCode = window.localStorage.getItem('sessionCode');
// const btnExitGame = document.getElementById('exit_game_button');
// const btnReturnToLobby = document.getElementById('return_to_lobby_play_button');
const numberOfOwlsPerPlayer = parseInt(window.localStorage.getItem('owlsPerPlayer'), 10);

class Game {
  constructor() {
    this.players = [];
  }

  listenMessages(socket) {
    socket.addEventListener('open', () => {
      socket.send(`{ "type": "changePlayerSocket", "sessionCode": "${sessionCode}", "playerId": "${myPlayerId}", "xhtml": "GameScreen" }`);
      this.setupEvents(socket);
      socket.send(`{ "type": "playerReady", "sessionCode": "${sessionCode}", "playerId": "${myPlayerId}"}`);
      
      socket.addEventListener('message', (event) => {
        const messageInJSON = JSON.parse(event.data);

        switch (messageInJSON.type) {
          case 'firstTurn':
            this.players[myPlayerId - 1].sendFirstSetOfCards();
            if (messageInJSON.playerFirstTurnId != myPlayerId) {
              this.players[myPlayerId - 1].myTurn = false;
            }
            document.getElementById(`hourglass_img${messageInJSON.playerFirstTurnId}`).style.visibility = 'visible';
            break;

          case 'setCardsChanged':
            if (messageInJSON.playerId != myPlayerId) {
              for (let j = 0; j < window.localStorage.getItem('cardsPerPlayer'); j += 1) {
                this.players[messageInJSON.playerId - 1].cardsInHand[j]
                  .setSpecificCardByName(messageInJSON.setCards[j].card);
              }
            }
            break;

          case 'specialCardToColor':
            this.players[messageInJSON.playerId - 1].cardsInHand[messageInJSON.cardUsed]
              .setSpecificCardByName(messageInJSON.newCardName);
            break;

          case 'playerInTurnFinished':
            if (messageInJSON.playerId != myPlayerId) {
              this.players[messageInJSON.playerId - 1].selectedOwlNum = messageInJSON.owlMoved;
              this.players[messageInJSON.playerId - 1].selectedCardNumber = messageInJSON.cardUsed;

              // Replica las acciones del jugador en turno
              const cardType = this.players[messageInJSON.playerId - 1].parseCardType();
              if (cardType === 'sun') {
                this.players[messageInJSON.playerId - 1].applySunCard();
              } else {
                this.players[messageInJSON.playerId - 1].moveOwl();
              }
              this.players[messageInJSON.playerId - 1].cardsInHand[messageInJSON.cardUsed]
                .setSpecificCardByName(messageInJSON.newCard);
            }

            // Si yo soy el próximo jugador, puedo iniciar mi turno
            if (messageInJSON.nextPlayerId == myPlayerId) {
              this.players[messageInJSON.nextPlayerId - 1].startTurn();
            }

            document.getElementById(`hourglass_img${messageInJSON.playerId}`).style.visibility = 'hidden';
            document.getElementById(`hourglass_img${messageInJSON.nextPlayerId}`).style.visibility = 'visible';
            break;

          case 'matchEnded':
            // Actualizar con los resultados de la partida ...
            /* for (let i = 1; i <= numberOfPlayers; i +=1) {
               document.getElementById(`podium_name${i}`).innerHTML
            = `${messageInJSON.podiumNicknames[i - 1]}`;
               document.getElementById(`podium_owl_img${i}`).src
            =`../images/owl_player${messageInJSON.podiumId[i - 1]}.svg`;
             } */
             
            document.getElementById('podium_name1').innerHTML = messageInJSON.winner;
            document.getElementById('podium_owl_img1').src = `../images/owl_player${messageInJSON.winnerId}.svg`;

            if (messageInJSON.second == '') {
              document.getElementById('podium_second').style.display = 'none';
            }else {
              document.getElementById('podium_owl_img2').src = `../images/owl_player${messageInJSON.secondId}.svg`;
              document.getElementById('podium_name2').innerHTML = messageInJSON.second;
            }
            if (messageInJSON.third == '') {
              document.getElementById('podium_third').style.display = 'none';
            }else{
              document.getElementById('podium_owl_img3').src = `../images/owl_player${messageInJSON.thirdId}.svg`;
              document.getElementById('podium_name3').innerHTML = messageInJSON.third;
            }
            if (messageInJSON.fourth == '') {
              document.getElementById('podium_fourth').style.display = 'none';
            }else{
              document.getElementById('podium_owl_img4').src = `../images/owl_player${messageInJSON.fourthId}.svg`;
              document.getElementById('podium_name4').innerHTML = messageInJSON.fourth;
            }

            document.getElementById('results_modal').style.display = 'flex';
            break;

          case 'matchHostAbandon':
            if (messageInJSON.xhtml != 'LobbyScreen') {
              window.localStorage.clear();
            }

            location.href = messageInJSON.xhtml;
            break;

          case 'matchGuestAbandon':
            const player = this.players[messageInJSON.playerId - 1];

            for (let i = 0; i < numberOfPlayers; i += 1) {
              for (let j = 0; j < numberOfOwlsPerPlayer; j += 1) {
                player.owls[j].xhtmlOwl.style.visibility = 'hidden';
                if (player.owls[j].position != -1) {
                  this.players[i].tableState[player.owls[j].position] = false;
                }
              }
            }
            window.localStorage.removeItem(`nickname${messageInJSON.playerId}`);
            this.removeTheNoPlayer(messageInJSON.playerId);
            break;

          case 'playerInTurnAbandon':
            if (messageInJSON.nextPlayerId == myPlayerId) {
              this.players[messageInJSON.nextPlayerId - 1].startTurn();
            }
            break;

          case 'matchTakeOutPlayer':
            location.href = '/';
            window.localStorage.clear();
            break;

          default:
            break;
        }
      });
    });

    client.addEventListener('close', () => {
      let onTurn = 0;
      if (this.players[myPlayerId - 1].myTurn) {
        onTurn = 1;
      }
      client.send(`{ "type": "matchAbandon",  "playerId": "${myPlayerId}", "abandonType": "exit", "sessionCode": "${sessionCode}", "myTurn": "${onTurn}" }`);
    });

  }

  setupEvents(client) {
    this.displayCredits();

    for (let i = 0; i < numMaxPlayers; i += 1) {
      if (i < numberOfPlayers) {
        this.players[i] = new Player(`${i + 1}`, client);
        this.players[i].setOwls();
        this.players[i].setCards();

        // Estas tres solo se deben hacer para mi ID
        if (i == myPlayerId - 1) {
          this.players[i].selectOwl();
          this.players[i].selectCard();
          this.players[i].getCard();
        }
      } else {
        this.removeTheNoPlayer(i + 1);
      }
      this.players[0].startTurn();
    }

    sunElement.style.bottom = '0px';
    for (let i = 1; i <= numberOfPlayers; i+= 1) {
      document.getElementById(`div_name_player${i}`).innerHTML = `P${i} ${window.localStorage.getItem(`nickname${i}`)}`;
      document.getElementById(`cellCorner${i}`).innerHTML = `P${i} ${window.localStorage.getItem(`nickname${i}`)}`; 
    }
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

  if (myPlayerId != 1) {
    document.getElementById('div_return_to_lobby_play_button').style.display = 'none';
    document.getElementById('div_return_to_lobby_results').style.display = 'none';
  }

  document.getElementById(`div_name_player${myPlayerId}`).style.fontWeight = 'bold';
  document.getElementById(`cellCorner${myPlayerId}`).style.fontWeight = 'bold'; 

  // Mensaje para el host del lobby (EXIT GAME dentro de GameScreen)
  document.getElementsByClassName('exit_game_button')[0].addEventListener('click', () => {
    if (window.confirm('Exit game will close the lobby.' // eslint-disable-line no-alert
    + '\n\nAre you sure you want to exit game?')) {
      let onTurn = 0;
      if (game.players[myPlayerId - 1].myTurn) {
        onTurn = 1;
      }
      client.send(`{ "type": "matchAbandon",  "playerId": "${myPlayerId}", "abandonType": "exit", "sessionCode": "${sessionCode}", "myTurn": "${onTurn}" }`);
    }
  });

  document.getElementsByClassName('exit_game_button')[1].addEventListener('click', () => {
    if (window.confirm('Exit game will close the lobby.' // eslint-disable-line no-alert
    + '\n\nAre you sure you want to exit game?')) {
      let onTurn = 0;
      if (game.players[myPlayerId - 1].myTurn) {
        onTurn = 1;
      }
      client.send(`{ "type": "matchAbandon",  "playerId": "${myPlayerId}", "abandonType": "exit", "sessionCode": "${sessionCode}", "myTurn": "${onTurn}" }`);
    }
  });

  // Mensaje para el host del lobby (RETURN TO LOBBY dentro de GameScreen)
  document.getElementsByClassName('return_to_lobby_play_button')[0].addEventListener('click', () => {
    if (window.confirm('Return to lobby will finish the current game.' // eslint-disable-line no-alert
    + '\n\nAre you sure you want to return to lobby?')) {
      client.send(`{ "type": "matchAbandon",  "playerId": "${myPlayerId}", "abandonType": "return", "sessionCode": "${sessionCode}" }`);
    }
  });

  // Mensaje para el host del lobby (RETURN TO LOBBY dentro de GameScreen)
  document.getElementsByClassName('return_to_lobby_play_button')[1].addEventListener('click', () => {
    if (window.confirm('Return to lobby will finish the current game.' // eslint-disable-line no-alert
    + '\n\nAre you sure you want to return to lobby?')) {
      client.send(`{ "type": "matchAbandon",  "playerId": "${myPlayerId}", "abandonType": "return", "sessionCode": "${sessionCode}" }`);
    }
  });

  //////////////////////////////////////////////////////////

  const client = new WebSocket(`ws://${window.location.host}`);

  const game = new Game();
  game.listenMessages(client);
}

window.addEventListener('load', main);
