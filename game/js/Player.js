import Owl from './Owl.js';
import Card from './Card.js';

// Datos que vienen del Lobby
const numberOfOwlsPerPlayer = 5;
const numberOfCardsPerPlayer = 3;
const numMaxOwls = 5;
// const myPlayerId = 1;
const cellSize = 47;

const owlCellAdjustSize = 12.5;

const tableCellColors = ['green', 'red', 'yellow',
  'lightblue', 'yellow', 'purple', 'green', 'red', 'green', 'purple', 'red',
  'lightblue', 'yellow', 'purple', 'green', 'red', 'lightblue', 'purple', 'green',
  'lightblue', 'yellow', 'purple', 'green', 'red', 'yellow', 'lightblue', 'red',
  'lightblue', 'yellow', 'purple', 'green', 'red'];

const tableDirections = ['right', 'up',
  'up', 'right', 'up', 'right', 'right', 'up', 'up', 'left', 'left', 'up',
  'left', 'up', 'up', 'left', 'left', 'down', 'down', 'left', 'down', 'left',
  'left', 'down', 'down', 'right', 'right', 'down', 'right', 'down', 'down', 'right'];

const tableCellState = [false, false,
  false, false, false, false, false, false, false, false, false, false,
  false, false, false, false, false, false, false, false, false, false,
  false, false, false, false, false, false, false, false, false, false];

const cellStartPlayer1 = 20;
const cellStartPlayer2 = 12;
const cellStartPlayer3 = 28;
const cellStartPlayer4 = 4;

const owlsFirstMovementCoordinates = [
  [0, 2], [1, 2], [2, 2], [2, 1], [2, 0],
  [-2, 0], [-2, 1], [-2, 2], [-1, 2], [0, 2],
  [2, 0], [2, -1], [2, -2], [1, -2], [0, -2],
  [0, -2], [-1, -2], [-2, -2], [-2, -1], [-2, 0],
];

const tableEntryColorPlayer1 = ['yellow', 'red'];
const tableEntryDirectionPlayer1 = 'down';

const tableEntryColorPlayer2 = ['lightblue', 'yellow'];
const tableEntryDirectionPlayer2 = 'left';

const tableEntryColorPlayer3 = ['purple', 'green'];
const tableEntryDirectionPlayer3 = 'right';

const tableEntryColorPlayer4 = ['purple', 'lightblue'];
const tableEntryDirectionPlayer4 = 'up';

const owlsToNestMovementCoordinates = [
  [1, 3], [2, 3], [3, 3], [3, 2], [3, 1],
  [-3, 1], [-3, 2], [-3, 3], [-2, 3], [-1, 3],
  [3, -1], [3, -2], [3, -3], [2, -3], [1, -3],
  [-1, -3], [-2, -3], [-3, -3], [-3, -2], [-3, -1],
];

const owlsInNestAdjustPosition = [
  // [left, top]
  [-owlCellAdjustSize, -owlCellAdjustSize],
  [owlCellAdjustSize, owlCellAdjustSize],
  [-owlCellAdjustSize, owlCellAdjustSize],
  [owlCellAdjustSize, -owlCellAdjustSize],
  [0, 0],
];

const sunElement = document.getElementById('sun');
const sunCell = (cellSize * 9) / 5;

export default class Player {
  constructor(id) {
    this.id = id;
    this.owls = [];
    this.cardsInHand = [];
    // Cambiar esto cuando se haga el ciclo del turno
    this.myTurn = true; // Poner en false cuando se termine el turno

    this.selectedOwlNum = -1;
    this.owlNotSelected = true;
    this.deckWaiting = false;
    this.selectedCardNumber = -1;
    this.owlsInNest = 0;
    this.hasSun = false;
    this.doubleTurn = false;
    this.tableEntryState = [false, false];

    this.startCell = 0;
    if (id == 1) {
      this.startCell = cellStartPlayer1;
    }
    if (id == 2) {
      this.startCell = cellStartPlayer2;
    }
    if (id == 3) {
      this.startCell = cellStartPlayer3;
    }
    if (id == 4) {
      this.startCell = cellStartPlayer4;
    }
  }

  setOwls() {
    for (let i = 0; i < numberOfOwlsPerPlayer; i += 1) {
      this.owls[i] = new Owl(document.getElementById(`owl${i + 1}_player${this.id}`));
      this.owls[i].xhtmlOwl.style.visibility = 'visible';
      this.owls[i].position = this.startCell - 2;
    }
  }

  setCards() {
    for (let i = 0; i < numberOfCardsPerPlayer; i += 1) {
      if (i < numberOfCardsPerPlayer) {
        this.cardsInHand[i] = new Card(document.getElementById(`img_card${i + 1}_player${this.id}`));
        this.cardsInHand[i].xhtmlCard.style.visibility = 'visible';
      } else {
        // Se borra la imagen de la carta `card${i + 1}_player${this.id}`
        const cardImg = document.getElementById(`img_card${i + 1}_player${this.id}`);
        if (cardImg) {
          cardImg.parentNode.removeChild(cardImg);
        }
      }
    }
  }

  selectOwl() {
    if (this.myTurn && this.deckWaiting === false) {
      for (let j = 0; j < numberOfOwlsPerPlayer; j += 1) {
        this.owls[j].xhtmlOwl.style.filter = 'drop-shadow(0 0 6px black)';
        const mouseoverOwlHandler = () => {
          if (this.deckWaiting === false && this.owls[j].insideNest === false
            && this.myTurn && this.hasSun === false) {
            if (j == this.selectedOwlNum || this.owlNotSelected) {
              this.owls[j].xhtmlOwl.style.transform = 'scale(1.3)';
            }
          }
        };
        this.owls[j].xhtmlOwl.addEventListener('mouseover', mouseoverOwlHandler);

        const mouseoutOwlHandler = () => {
          if (this.deckWaiting === false && this.owls[j].insideNest === false
            && this.myTurn && this.hasSun === false) {
            if (this.owlNotSelected) {
              this.owls[j].xhtmlOwl.style.transform = 'scale(1)';
            }
          }
        };
        this.owls[j].xhtmlOwl.addEventListener('mouseout', mouseoutOwlHandler);

        const clickOwlHandler = () => {
          if (this.deckWaiting === false && this.owls[j].insideNest === false
            && this.myTurn && this.hasSun === false) {
            if (j == this.selectedOwlNum || this.owlNotSelected) {
              this.owlNotSelected = false;
              this.selectedOwlNum = j;
              this.owls[j].xhtmlOwl.style.filter = 'drop-shadow(0 0 6px yellow)';
              this.selectedOwlNum = j;
              this.enableCards();
            }
          }
        };
        this.owls[j].xhtmlOwl.addEventListener('click', clickOwlHandler);
      }
    }
  }

  enableCards() {
    for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
      this.cardsInHand[j].xhtmlCard.style.filter = 'drop-shadow(0 0 6px red)';
    }
  }

  disableCards() {
    for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
      this.cardsInHand[j].xhtmlCard.style.filter = 'drop-shadow(0 0 0)';
    }
  }

  selectCard() {
    for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
      this.cardsInHand[j].xhtmlCard.addEventListener('click', () => {
        this.selectedCardNumber = j;
        const cardType = this.parseCardType();
        if (cardType === 'sun') {
          this.applySunCard();
          this.cardsInHand[this.selectedCardNumber].xhtmlCard.style.visibility = 'hidden';
          document.getElementById('deck_img').style.filter = 'drop-shadow(0 0 6px red)';
          this.deckWaiting = true;
          this.disableCards();
        }

        if (this.owlNotSelected === false && cardType === 'color') {
          this.moveOwl();

          this.owls[this.selectedOwlNum].xhtmlOwl.style.filter = 'drop-shadow(0 0 6px black)';
          this.owls[this.selectedOwlNum].xhtmlOwl.style.transform = 'scale(1)';
          this.selectedOwlNum = -1;
          this.owlNotSelected = true;
          this.disableCards();

          this.cardsInHand[this.selectedCardNumber].xhtmlCard.style.visibility = 'hidden';
          document.getElementById('deck_img').style.filter = 'drop-shadow(0 0 6px red)';
          this.deckWaiting = true;
        }

        if (this.owlNotSelected === false && cardType === 'special') {
          this.applySpecialCard();
        }
      });
    }
  }

  getCard() {
    // Se tiene que hacer click en el deck para "recibir" la otra carta
    // Se cambia la imagen de la carta que se encontraba escondida y se hace visible
    document.getElementById('deck_img').addEventListener('click', () => {
      for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
        if (this.cardsInHand[j].xhtmlCard.style.visibility === 'hidden') {
          if (this.deckWaiting === true) {
            this.cardsInHand[j].changeImage();
            const cardType = this.parseCardType();
            if (cardType === 'sun') {
              this.hasSun = true;
              this.cardsInHand[j].xhtmlCard.style.filter = 'drop-shadow(0 0 6px red)';
            }
            document.getElementById('deck_img').style.filter = 'drop-shadow(0 0 0)';
            this.cardsInHand[j].xhtmlCard.style.visibility = 'visible';
          }
        }
      }
      this.deckWaiting = false;
      this.endTurn();
    });
  }

  startTurn() {
    this.myTurn = true;
    if (this.id == 1) {
      document.getElementById('hourglass_img1').style.visibility = 'visible';
    }
    if (this.id == 2) {
      document.getElementById('hourglass_img2').style.visibility = 'visible';
    }
    if (this.id == 3) {
      document.getElementById('hourglass_img3').style.visibility = 'visible';
    }
    if (this.id == 4) {
      document.getElementById('hourglass_img4').style.visibility = 'visible';
    }
  }

  endTurn() {
    if (this.doubleTurn === false) {
      if (this.id == 1) {
        document.getElementById('hourglass_img1').style.visibility = 'hidden';
      }
      if (this.id == 2) {
        document.getElementById('hourglass_img2').style.visibility = 'hidden';
      }
      if (this.id == 3) {
        document.getElementById('hourglass_img3').style.visibility = 'hidden';
      }
      if (this.id == 4) {
        document.getElementById('hourglass_img4').style.visibility = 'hidden';
      }
      // this.myTurn = false;
    } else {
      this.doubleTurn = false;
    }
  }

  moveOwlToStartPosition() {
    this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize
      * owlsFirstMovementCoordinates[(numMaxOwls * this.id)
      - (numMaxOwls - this.selectedOwlNum)][0]}px`;

    this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize
      * owlsFirstMovementCoordinates[(numMaxOwls * this.id)
      - (numMaxOwls - this.selectedOwlNum)][1]}px`;

    // (numMaxOwls * this.id) - (numMaxOwls - owl);
    // (5 * 1(#jugador)) -  (5 - 0(#búho)) = 0 (posición en el vector)
    // (5 * 1(#jugador)) -  (5 - 1(#búho)) = 1 (posición en el vector)
    // (5 * 1(#jugador)) -  (5 - 2(#búho)) = 2 (posición en el vector)
  }

  parseCardType() {
    let cardType;

    if (this.cardsInHand[this.selectedCardNumber].cardName === 'card_sun') {
      cardType = 'sun';
    } else {
      const nameSplit = this.cardsInHand[this.selectedCardNumber].cardName.split('_');

      if (nameSplit[0] === 'special') {
        cardType = 'special';
      } else {
        cardType = 'color';
      }
    }

    return cardType;
  }

  moveOwl() {
    let searchSum = 0;
    let travelAndSearchSum = searchSum + this.owls[this.selectedOwlNum].cellsTraveled;
    const chosenCardColor = this.cardsInHand[this.selectedCardNumber].cardName.split('_')[1];
    let sameColorEmpty = false;
    this.owls[this.selectedOwlNum].justPassing = false;

    // Recorrer el tablero desde la posición actual del búho
    // Con un + 1 para que no busque en la casilla que está actualmente
    let movementCompleted = false;
    for (let i = (this.owls[this.selectedOwlNum].position + 1) % 32;
      i < 32 && !movementCompleted
      && !this.owls[this.selectedOwlNum].standBeforeNest
      && travelAndSearchSum < 30;
      i = ((i += 1) % 32)) {
      searchSum += 1;
      travelAndSearchSum = searchSum + this.owls[this.selectedOwlNum].cellsTraveled;

      // Si el búho sigue dentro de su esquina, lo saca a su primera casilla antes de moverlo
      if (this.owls[this.selectedOwlNum].isPlaying === false) {
        this.moveOwlToStartPosition();
        this.owls[this.selectedOwlNum].position = i;
        this.owls[this.selectedOwlNum].isPlaying = true;

        // Si la primera casilla está ocupada
        if (tableCellState[this.startCell - 1] === true) {
          this.owls[this.selectedOwlNum].firstMoveCompleted = true;
        }
      }

      if (tableCellColors[i] === chosenCardColor
      && tableCellState[i] === false && travelAndSearchSum < 30) {
        sameColorEmpty = true;
      }

      // Mover el búho a la casilla que coincide con la carta
      if (sameColorEmpty || travelAndSearchSum == 29) {
        if (!sameColorEmpty && travelAndSearchSum == 29) {
          this.owls[this.selectedOwlNum].justPassing = true;
        }

        // Si el primer movimiento del búho es a su primera casilla posible,
        // no se deben hacer más operaciones
        if (this.owls[this.selectedOwlNum].firstMoveCompleted === false
          && i === this.startCell - 1) {
          movementCompleted = true;
        }
        this.owls[this.selectedOwlNum].firstMoveCompleted = true;

        // Mover el búho por cada casilla, desde su posición inicial
        // hasta donde encontró la casilla con el color de la carta
        let tempOwlPosition = (this.owls[this.selectedOwlNum].position + 1) % 32;
        while (tempOwlPosition !== ((i + 1) % 32) && !movementCompleted
        && travelAndSearchSum < 30) {
          this.moveOwlToNextPosition(tempOwlPosition);
          tempOwlPosition = ((tempOwlPosition += 1) % 32);
        }

        this.owls[this.selectedOwlNum].previousPosition = this.owls[this.selectedOwlNum].position;

        // Se deja la casilla anterior como vacía
        // Si el búho no está en su primer movimiento
        if (this.owls[this.selectedOwlNum].firstMove === false) {
          tableCellState[this.owls[this.selectedOwlNum].previousPosition] = false;
        } else {
          this.owls[this.selectedOwlNum].firstMove = false;
        }
        this.owls[this.selectedOwlNum].position = i;
        movementCompleted = true;
      }
    }

    // Mover el búho a la casilla antes del nido que coincide con la carta
    // Si ha recorrido lo suficiente para pasar a las casillas antes
    // del nido y no encuentra casilla de color vacía
    if (travelAndSearchSum >= 29 && sameColorEmpty == false) {
      this.owls[this.selectedOwlNum].cellsTraveled += searchSum;
      if (this.id == 1) {
        this.moveOwlNearNest(tableEntryColorPlayer1,
          tableEntryDirectionPlayer1);
      }
      if (this.id == 2) {
        this.moveOwlNearNest(tableEntryColorPlayer2,
          tableEntryDirectionPlayer2);
      }
      if (this.id == 3) {
        this.moveOwlNearNest(tableEntryColorPlayer3,
          tableEntryDirectionPlayer3);
      }
      if (this.id == 4) {
        this.moveOwlNearNest(tableEntryColorPlayer4,
          tableEntryDirectionPlayer4);
      }
    } else {
      this.owls[this.selectedOwlNum].cellsTraveled += searchSum;
      tableCellState[this.owls[this.selectedOwlNum].position] = true;
    }
  }

  moveOwlToNextPosition(tempOwlPosition) {
    if (tableDirections[tempOwlPosition] === 'right') {
      const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.left, 10)
       + cellSize;
      this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${newUbication}px`;
    }
    if (tableDirections[tempOwlPosition] === 'left') {
      const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.left, 10)
       - cellSize;
      this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${newUbication}px`;
    }
    if (tableDirections[tempOwlPosition] === 'up') {
      const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.top, 10)
       - cellSize;
      this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${newUbication}px`;
    }
    if (tableDirections[tempOwlPosition] === 'down') {
      const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.top, 10)
       + cellSize;
      this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${newUbication}px`;
    }
  }

  moveOwlNearNest(playerEntryColor, playerEntryDirection) {
    let toNest = false;
    let colorFound = false;
    let positionFound = -1;
    const chosenCardColor = this.cardsInHand[this.selectedCardNumber].cardName.split('_')[1];

    // Recorre el vector específico para el jugador de sus casillas anteriores al nido
    for (let j = 0; j < 2 && !colorFound; j += 1) {
      // No encuentra casilla del mismo color a la carta
      if (playerEntryColor[j] !== chosenCardColor) {
        toNest = true;
      } else
      // La casilla está desocupada
      if (this.tableEntryState[j] == false) {
        toNest = false;
        colorFound = true;
        positionFound = j;
        this.tableEntryState[j] = true;
        if (this.owls[this.selectedOwlNum].standBeforeNest) {
          this.tableEntryState[this.owls[this.selectedOwlNum].positionBeforeNest] = false;
        }
        this.owls[this.selectedOwlNum].positionBeforeNest = j;
      } else {
        toNest = true;
      }
    }

    // Entra al nido
    if (toNest) {
      // Casos especiales para dejar la casilla actual desocupada antes de entrar al nido
      for (let i = 0; i < 2; i += 1) {
        if (this.tableEntryState[i] == true
          && this.owls[this.selectedOwlNum].positionBeforeNest == i) {
          this.tableEntryState[i] = false;
        }
      }
      if (this.owls[this.selectedOwlNum].justPassing == false
        && !this.owls[this.selectedOwlNum].standBeforeNest) {
        tableCellState[this.owls[this.selectedOwlNum].position] = false;
      }
      this.moveOwlToNest();
      this.owlsInNest += 1;
      this.owls[this.selectedOwlNum].insideNest = true;
      if (this.owlsInNest === numberOfOwlsPerPlayer) {
        document.getElementById('results_modal').style.display = 'flex';
      }
    } else {
      // Se mueve a la casilla del color antes de entrar al nido
      this.searchBeforeNest(playerEntryDirection, positionFound);
      this.owls[this.selectedOwlNum].standBeforeNest = true;
    }
  }

  searchBeforeNest(playerEntryDirection, positionFound) {
    // Intento de recorrer el vector que le corresponde a cada jugador

    let searchSum = 0;

    // Cambiar tiempo cuando el movimiento funcione del todo bien
    this.owls[this.selectedOwlNum].xhtmlOwl.style.transitionDuration = '0.1s';

    // Mover el búho por cada casilla, desde su posición inicial hasta
    // donde encontró la casilla con el color de la carta
    for (let i = 0; i <= positionFound; i += 1) {
      if (this.owls[this.selectedOwlNum].standBeforeNest) {
        i = 1;
      }
      searchSum += 1;
      this.owls[this.selectedOwlNum].xhtmlOwl.style.transitionDuration = '1s';
      if (playerEntryDirection === 'right') {
        const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.left, 10)
         + cellSize;
        this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${newUbication}px`;
      }
      if (playerEntryDirection === 'left') {
        const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.left, 10)
         - cellSize;
        this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${newUbication}px`;
      }
      if (playerEntryDirection === 'up') {
        const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.top, 10)
         - cellSize;
        this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${newUbication}px`;
      }
      if (playerEntryDirection === 'down') {
        const newUbication = parseInt(this.owls[this.selectedOwlNum].xhtmlOwl.style.top, 10)
         + cellSize;
        this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${newUbication}px`;
      }
    }
    this.owls[this.selectedOwlNum].cellsTraveled += searchSum;
    this.owls[this.selectedOwlNum].previousPosition = this.owls[this.selectedOwlNum].position;
    this.owls[this.selectedOwlNum].position = positionFound;

    // Si anteriormente estaba en la última casilla
    // antes de entrar al pasillo (vector de 2 casillas)
    // Es diferente a cuando se acomoda el búho en esta casilla para que luego entre
    if (!this.owls[this.selectedOwlNum].justPassing) {
      // Se excluyen los casos de estar dentro del pasillo (vector de 2 casillas)
      // para evitar que deje casillas de afuera vacías donde puede haber otro búho
      if (!this.owls[this.selectedOwlNum].standBeforeNest) {
        tableCellState[this.owls[this.selectedOwlNum].previousPosition] = false;
      }
    }
  }
  
  /*
  * Acomoda los búhos dentro del nido
  */
  moveOwlToNest() {
   
    // if (this.id == 1) {
      // if (this.selectedOwlNum == 0) {
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize * 3 - owlCellAdjustSize}px`;
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize - owlCellAdjustSize}px`;
      // }
      // if (this.selectedOwlNum == 1) {
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize * 3 + owlCellAdjustSize}px`;
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize * 2 + owlCellAdjustSize}px`;
      // }
      // if (this.selectedOwlNum == 2) {
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize * 3 - owlCellAdjustSize}px`;
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize * 3 + owlCellAdjustSize}px`;
      // }
      // if (this.selectedOwlNum == 3) {
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize * 2 + owlCellAdjustSize}px`;
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize * 3 - owlCellAdjustSize}px`;
      // }
      // if (this.selectedOwlNum == 4) {
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize}px`;
      //   this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize * 3}px`;
      // }
    // }
    // if(this.id === 2){}
    // if(this.id === 3){}
    // if(this.id === 4){}

  

    

    this.owls[this.selectedOwlNum].xhtmlOwl.style.left = `${cellSize
      * owlsToNestMovementCoordinates[(numMaxOwls * this.id)
      - (numMaxOwls - this.selectedOwlNum)][0]
      + owlsInNestAdjustPosition[this.selectedOwlNum][0]}px`;

    this.owls[this.selectedOwlNum].xhtmlOwl.style.top = `${cellSize
      * owlsToNestMovementCoordinates[(numMaxOwls * this.id)
      - (numMaxOwls - this.selectedOwlNum)][1]
      + owlsInNestAdjustPosition[this.selectedOwlNum][1]}px`;

    // (numMaxOwls * this.id) - (numMaxOwls - owl);
    // (5 * 1(#jugador)) -  (5 - 0(#búho)) = 0 (posición en el vector)
    // (5 * 1(#jugador)) -  (5 - 1(#búho)) = 1 (posición en el vector)
    // (5 * 1(#jugador)) -  (5 - 2(#búho)) = 2 (posición en el vector)
  }

  parseSpecialCardType() {
    let cardType;
    const nameSplit = this.cardsInHand[this.selectedCardNumber].cardName.split('_');

    switch (nameSplit[2]) {
      case 'rainbow':
        cardType = 'rainbow';
        break;

      case 'rollback':
        cardType = 'rollback';
        break;

      case 'swap':
        cardType = 'swap';
        break;

      case 'x2':
        cardType = 'x2';
        break;

      default:
        break;
    }

    return cardType;
  }

  applySpecialCard() {
    const cardType = this.parseSpecialCardType();

    switch (cardType) {
      case 'rainbow':
        this.applyRainbowSpecialCard();
        break;

      case 'rollback':
        this.applyRainbowSpecialCard();
        break;

      case 'swap':
        this.applyRainbowSpecialCard();
        break;

      case 'x2':
        this.applyX2SpecialCard();
        break;

      default:
        break;
    }
  }

  applyRainbowSpecialCard() {
    for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
      this.cardsInHand[j].xhtmlCard.style.visibility = 'hidden';
    }
    document.getElementById('rainbow_dropdown_container').style.display = 'block';

    const rainbowElement = document.getElementById('rainbow_colors_option');
    // rainbowElement.addEventListener('change', () => {
    //   if (rainbowElement.value !== '0') {
    //     this.cardsInHand[this.selectedCardNumber].setSpecificCard(rainbowElement.value);
    //     for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
    //       this.cardsInHand[j].xhtmlCard.style.visibility = 'visible';
    //     }
    //     rainbowElement.value = '0';
    //     document.getElementById('rainbow_dropdown_container').style.display = 'none';
    //     this.enableCards();
    //   }
    // });
    const changeRainbowColor = () => {
      if (rainbowElement.value !== '0') {
        this.cardsInHand[this.selectedCardNumber].setSpecificCard(rainbowElement.value);
        for (let j = 0; j < numberOfCardsPerPlayer; j += 1) {
          this.cardsInHand[j].xhtmlCard.style.visibility = 'visible';
        }
        rainbowElement.value = '0';
        document.getElementById('rainbow_dropdown_container').style.display = 'none';
        this.enableCards();
        rainbowElement.removeEventListener('change', changeRainbowColor);
      }
    };
    rainbowElement.addEventListener('change', changeRainbowColor);
  }

  applyX2SpecialCard() {
    this.doubleTurn = true;
    this.cardsInHand[this.selectedCardNumber].setColorCard();

    /* Terminar de implementar cuando servidor esté listo */
  }

  applyRollbackSpecialCard() {
    /* Multijugador */

  }

  applySwapSpecialCard() {
    /* Multijugador */

  }

  applySunCard() {
    // Mover el sol una casilla
    if (parseInt(sunElement.dataset.space, 10) < 5) {
      const newUbication = parseInt(sunElement.style.bottom, 10) + sunCell;
      sunElement.style.bottom = `${newUbication}px`;
      sunElement.dataset.space = `${parseInt(sunElement.dataset.space, 10) + 1}`;
    }
    if (parseInt(sunElement.dataset.space, 10) === 5) {
      let owlToReset = 0;

      while (this.owls[owlToReset].insideNest === true) {
        owlToReset += 1;
      }

      // Buscar el búho con mayor avance
      for (let j = owlToReset + 1; j < numberOfOwlsPerPlayer; j += 1) {
        if (this.owls[j].insideNest === false
        && this.owls[owlToReset].cellsTraveled < this.owls[j].cellsTraveled) {
          owlToReset = j;
        }
      }

      // Mover al búho al inicio
      tableCellState[this.owls[owlToReset].position] = false;
      this.owls[owlToReset].setInitialValues();
      this.owls[owlToReset].position = this.startCell - 2;

      // Regresar el Sol a su posición original
      sunElement.style.transition = 'bottom 3s ease-out';
      sunElement.style.bottom = '0';
      sunElement.dataset.space = '1';
      // sunElement.style.transition = 'bottom 1s ease-out';
    }
    this.hasSun = false;
  }

  // sleep(milliseconds) {
  //   const date = Date.now();
  //   let currentDate = null;
  //   do {
  //     currentDate = Date.now();
  //   } while (currentDate - date < milliseconds);
  // }
}
