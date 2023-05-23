import Player from '../models/Player.js';

const maxNumberOfPlayers = 4;
const numberOfSettings = 4;
class MessageController {
  constructor() {
    this.mapPlayerWs = new Map(); // 'code-playerId' -> Player() //socket:, nickname:
    this.wsServer = '';
  }

  init(wsServer) {
    this.wsServer = wsServer;
    this.wsServer.on('connection', (socket) => {
      socket.on('message', (message) => {
        console.log(`Server receive: ${message}`);
        this.parseMessage(message, socket);
      });

      socket.on('close', () => {
        console.log('Client closed the connection');
      });
    });

    this.wsServer.on('close', () => {
      console.log('Server closed the connection');
      this.mapPlayerWs.clear();
    });
  }

  parseMessage(message, socket) {
    const messageInJSON = JSON.parse(message);
    let serverMessage = '';
    let nextPlayerId = '';
    let msg = '';
    let cards = '';
    let everyoneIsReady = true;

    const code = this.generateCode();
    const newPlayerId = this.generatePlayerId(messageInJSON.sessionCode);
    const numPlayers = this.getNumPlayers(messageInJSON.sessionCode);
    let losers = ['', '', ''];
    let losersId = ['', '', ''];

    // nombres de jugadores en la sesión
    const playersNickname = this.getNicknames(messageInJSON.sessionCode, newPlayerId);

    switch (messageInJSON.type) {
      case 'changePlayerSocket':
        this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${messageInJSON.playerId}`).socket = socket;

        if (messageInJSON.xhtml = "LobbyScreen") {
          const settings = this.getSettings(this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${1}`));
          serverMessage = `{ "type": "actualSettings", "settings": [${settings}] }`;
          socket.send(serverMessage);
        }

        break;

      case 'playerReady':
        this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${messageInJSON.playerId}`).readyForGame = true;

        for (let i = 1; i <= this.getNumPlayers(messageInJSON.sessionCode)
        && everyoneIsReady; i += 1) {
          if (this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${i}`).readyForGame == false) {
            everyoneIsReady = false;
          }
        }

        if (everyoneIsReady) {
          serverMessage = '{ "type": "firstTurn", "playerFirstTurnId": "1" }';
          this.broadcast(messageInJSON.sessionCode, serverMessage);
        }

        break;

      case 'createLobbyPetition':
        // Assembling message "Lobby Created"
        serverMessage = `{ "type": "lobbyCreated", "sessionCode": "${code}", "xhtmlPage": "LobbyScreen", "playerId": "1" }`;

        // Send message to client
        socket.send(serverMessage);
        this.mapPlayerWs.set(`${code}-1`, new Player(messageInJSON.nickname, socket));

        console.log(`Server sent: ${serverMessage}`);
        break;

      case 'joinLobbyPetition':
        // Valida que la sesión tenga menos de 4 jugadores
        if (newPlayerId != -1) {
          // Assembling message "Joined to Lobby"
          for (let i = 0; i < playersNickname.length; i += 1) {
            msg += `{"nickname": "${playersNickname[i]}"}`;
            if (i != playersNickname.length - 1) {
              msg += ', ';
            }
          }

          if (this.mapPlayerWs.has(`${messageInJSON.sessionCode}-${1}`) && !this.mapPlayerWs.has(`${messageInJSON.sessionCode}-${4}`)) {
            serverMessage = `{ "type": "joinedToLobby", "xhtmlPage": "LobbyScreen", "players": [${msg}], "playerId": "${newPlayerId}" }`;
            this.mapPlayerWs.set(`${messageInJSON.sessionCode}-${newPlayerId}`, new Player(messageInJSON.nickname, socket));
          } else {
            serverMessage = `{ "type": "joinedToLobby", "xhtmlPage": "/" }`;
          }
          
          // Send message to client
          socket.send(serverMessage);
          console.log(`Server sent ${serverMessage}`);

          // Assembling message "New Player Joined" Broadcast
          serverMessage = `{ "type": "newPlayerJoined", "nickname":"${messageInJSON.nickname}", "playerId": "${newPlayerId}" }`;
          this.broadcast(messageInJSON.sessionCode, serverMessage);
        }
        break;

      case 'settingsChanged':
        // Assembling message "New Settings
        serverMessage = `{ "type": "newSettings", "setting": "${messageInJSON.setting}", "value": "${messageInJSON.value}" }`;
        this.broadcast(messageInJSON.sessionCode, serverMessage);

        // Guarda los las configuraciones actuales en el objeto jugador del Host de la sesión
        switch (messageInJSON.setting) {
          case 'option_X2Card':
            this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${1}`).settings[0] = messageInJSON.value;
            break;
          
          case 'option_Rainbow':
            this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${1}`).settings[1] = messageInJSON.value;
            break;

          case 'option_owls':
            this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${1}`).settings[2] = messageInJSON.value;
            break;

          case 'option_cards':
            this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${1}`).settings[3] = messageInJSON.value;
            break;

          default:
            break;
        }
        break;

      case 'startPetition':
        // Assembling message "Match Started"
        serverMessage = `{ "type": "startMatch", "xhtmlPage": "GameScreen" , "numPlayers": "${numPlayers}"}`;

        // Send message by broadcast
        this.broadcast(messageInJSON.sessionCode, serverMessage);
        break;

      case 'newSetCards':
        for (let i = 0; i < messageInJSON.setCards.length; i += 1) {
          cards += `{"card": "${messageInJSON.setCards[i].card}"}`;
          if (i != messageInJSON.setCards.length - 1) {
            cards += ', ';
          }
        }
        serverMessage = `{ "type": "setCardsChanged", "playerId": "${messageInJSON.playerId}", "setCards": [${cards}] }`;
        this.broadcast(messageInJSON.sessionCode, serverMessage);
        break;

      case 'specialCardToColor':
        serverMessage = `{ "type": "specialCardToColor", "playerId": "${messageInJSON.playerId}", "cardUsed": "${messageInJSON.cardUsed}", "newCardName": "${messageInJSON.newCardName}" }`;
        this.broadcast(messageInJSON.sessionCode, serverMessage);
        break;

      case 'turnFinished':
        // Assembling message "Player In Turn Finished"
        nextPlayerId = this.getNextPlayer(messageInJSON.sessionCode, messageInJSON.playerId);

        // Un jugador puede tener turnos dobles
        if (messageInJSON.turnFinished == 'false') {
          nextPlayerId = messageInJSON.playerId;
        }
        serverMessage = `{ "type": "playerInTurnFinished", "playerId": "${messageInJSON.playerId}", "owlMoved": "${messageInJSON.owlMoved}", "cardUsed": "${messageInJSON.cardUsed}", "newCard": "${messageInJSON.newCard}", "nextPlayerId": "${nextPlayerId}" }`;

        // Send message by broadcast
        this.broadcast(messageInJSON.sessionCode, serverMessage);

        if (messageInJSON.winner == 'true') {
          let numLosers = 0;
          for (let i = 0; i < this.getNumPlayers(messageInJSON.sessionCode); i += 1) {
            if (i + 1 != parseInt(messageInJSON.playerId, 10)) {
              losers[numLosers] = this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${i + 1}`).nickname;
              losersId[numLosers] = i + 1;
              numLosers += 1;
            }
          }
          serverMessage = `{ "type": "matchEnded", "winnerId": "${messageInJSON.playerId}", "winner": "${this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${messageInJSON.playerId}`).nickname}", "second": "${losers[0]}", "secondId": "${losersId[0]}", "third": "${losers[1]}", "thirdId": "${losersId[1]}", "fourth": "${losers[2]}", "fourthId": "${losersId[2]}" }`;
          this.broadcast(messageInJSON.sessionCode, serverMessage);
        }
        break;

      case "abandon":
        if (messageInJSON.playerId == "1") {
          //Assembling message "Host Abandon"
          serverMessage = `{ "type": "hostAbandon", "xhtmlPage": "HomeScreen"}`;
          
          //Send message by broadcast
          this.broadcast(messageInJSON.sessionCode, serverMessage);

          this.deleteSession(messageInJSON.sessionCode);
        } else {
          //Assembling message "Guest Abandon"
          serverMessage = `{ "type": "guestAbandon", "nickname": "${playersNickname[messageInJSON.playerId-1]}", "playerId": "${messageInJSON.playerId}" }`;
          //Send message by broadcast
          this.broadcast(messageInJSON.sessionCode, serverMessage);

         // this.mapPlayerWs.delete(`${messageInJSON.sessionCode}-${messageInJSON.playerId}`);

          for (let i = parseInt(messageInJSON.playerId, 10); i < numPlayers; i += 1) {
            if (this.mapPlayerWs.has(`${messageInJSON.sessionCode}-${i + 1}`)) {
              this.mapPlayerWs.set(`${messageInJSON.sessionCode}-${messageInJSON.playerId}`, this.mapPlayerWs.get(`${messageInJSON.sessionCode}-${i+1}`));
            }
          }
          this.mapPlayerWs.delete(`${messageInJSON.sessionCode}-${numPlayers}`);

          //Assembling message "Take Out Player"
          serverMessage = `{ "type": "takeOutPlayer", "xhtmlPage": "HomeScreen"}`;
          //Send message to client
          socket.send(serverMessage);
        }

        break; 

      case "matchAbandon":
        if (messageInJSON.playerId == "1") {
          //Assembling message "Match Host Abandon"
          if (messageInJSON.abandonType == 'exit'){
            serverMessage = `{ "type": "matchHostAbandon", "xhtml": "/" }`;
          } else{
            serverMessage = `{ "type": "matchHostAbandon", "xhtml": "LobbyScreen" }`;
          }

          //Send message by broadcast
          this.broadcast(messageInJSON.sessionCode, serverMessage);
          if (messageInJSON.abandonType == 'exit'){
            this.deleteSession(messageInJSON.sessionCode);
          }
        } else {
          //Assembling message "Match Guest Abandon"
          serverMessage = `{ "type": "matchGuestAbandon", "nickname": "${playersNickname[messageInJSON.playerId-1]}", "playerId": "${messageInJSON.playerId}" }`;
          //Send message by broadcast
          this.broadcast(messageInJSON.sessionCode, serverMessage);
          this.mapPlayerWs.delete(`${messageInJSON.sessionCode}-${messageInJSON.playerId}`);

          if (messageInJSON.myTurn == '1') {
            nextPlayerId = this.getNextPlayer(messageInJSON.sessionCode, messageInJSON.playerId);
            serverMessage = `{ "type": "playerInTurnAbandon", "nextPlayerId": "${nextPlayerId}" }`;
            this.broadcast(messageInJSON.sessionCode, serverMessage);
          }

          //Assembling message "Take Out Player"
          serverMessage = `{ "type": "matchTakeOutPlayer", "xhtmlPage": "HomeScreen"}`;
          //Send message to client
          socket.send(serverMessage);
        }
        break;

      // this.mapPlayerWs.get(`${messageInJSON.sessionCode}-
      // ${messageInJSON.playerId}`).readyForGame = false;
      
      default:
        break;
    }
  }

  // Revisar 
  getNextPlayer(sessionCode, playerId) {
    let found = false;
    let nextPlayerId = parseInt(playerId, 10);
    while (found == false) {
      nextPlayerId = (nextPlayerId + 1) % (maxNumberOfPlayers + 1);
      if (nextPlayerId == 0) {
        nextPlayerId = 1;
      }
      if (this.mapPlayerWs.has(`${sessionCode}-${nextPlayerId}`)) {
        found = true;
      }
    }
    return nextPlayerId;
  }

  getNumPlayers(sessionCode) {
    let numPlayer = 1;
    for (let id = 2; id <= maxNumberOfPlayers; id += 1) {
      if (this.mapPlayerWs.has(`${sessionCode}-${id}`)) {
        numPlayer += 1;
      }
    }
    return numPlayer;
  }

  generateCode() {
    const length = 7;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; i -= 1) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
  }

  deleteSession(sessionCode){
    for (let id = 1; id <= maxNumberOfPlayers; id += 1) {
      if (this.mapPlayerWs.has(`${sessionCode}-${id}`)) {
        this.mapPlayerWs.delete(`${sessionCode}-${id}`);
      }
    }
  }

  broadcast(sessionCode, serverMessage) {
    /* Se envía el mensaje a todos los jugadores de la sesión */
    for (let id = 1; id <= maxNumberOfPlayers; id += 1) {
      if (this.mapPlayerWs.has(`${sessionCode}-${id}`)) {
        console.log(`Server sent: ${serverMessage} to ID: ${id}`);
        this.mapPlayerWs.get(`${sessionCode}-${id}`).socket.send(serverMessage);
      }
    }
  }

  generatePlayerId(sessionCode) {
    /* recorrer el código de sesión para encontrar la cantidad
    de jugadores que tenga y asignar el código al jugador nuevo */
    for (let id = 1; id <= maxNumberOfPlayers; id += 1) {
      if (this.mapPlayerWs.has(`${sessionCode}-${id}`) == false) {
        return id;
      }
    }
    return -1;
  }

  getNicknames(sessionCode, myPlayerId) {
    /* recorrer el código de sesión para crear un arreglo con los
    nombres de los jugadores */
    const players = [];
    for (let id = 1; id < myPlayerId; id += 1) {
      players[id - 1] = this.mapPlayerWs.get(`${sessionCode}-${id}`).nickname;
    }
    return players;
  }

  getSettings(player) {
    /* recorrer el código de sesión para crear un string con los
    settings de la sesión */
    let settings = ``;
    for (let i = 0; i < player.settings.length; i += 1) {
      settings += `{ "value": "${player.settings[i]}" }`;
      if (i != player.settings.length - 1) {
        settings += ', ';
      }
    }
    return settings;
  }
}

// Singleton
const messageController = new MessageController();
export default messageController;
