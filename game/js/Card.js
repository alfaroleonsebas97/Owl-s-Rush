export default class Card {
  constructor(cardElement) {
    this.colorCards = ['card_red', 'card_lightblue', 'card_yellow', 'card_purple', 'card_green'];
    this.specialCards = ['special_card_x2', 'special_card_rainbow', 'special_card_swap', 'special_card_rollback'];
    this.sunCard = 'card_sun';
    this.firstCard = true;

    this.xhtmlCard = cardElement;
    this.cardName = this.generateCard();
    this.xhtmlCard.src = `../images/${this.cardName}.svg`;
  }

  generateCard() {
    const cardProbability = Math.random();
    let cardGenerated = '';
    if (cardProbability < 0.7 || this.firstCard === true) {
      const colorCardProbability = Math.floor(Math.random() * 5);
      cardGenerated = this.colorCards[colorCardProbability];
    } else if (cardProbability >= 0.7 && cardProbability < 0.85) {
      const specialCardProbability = Math.floor(Math.random() * 2);
      cardGenerated = this.specialCards[specialCardProbability];
    } else if (cardProbability >= 0.85 && cardProbability < 1) {
      cardGenerated = this.sunCard;
    }

    // SOLES
    // if (cardProbability < 0.4  || this.firstCard === true) {
    //   let colorCardProbability = Math.floor(Math.random() * 5);
    //   cardGenerated = this.colorCards[colorCardProbability];
    // } else if (cardProbability >= 0.4 && cardProbability < 0.6){
    //   let specialCardProbability = Math.floor(Math.random() * 4);
    //   cardGenerated = this.specialCards[specialCardProbability];
    // } else if (cardProbability >= 0.6 && cardProbability < 1) {
    //   cardGenerated = this.sunCard;
    // }

    // SPECIALS
    // if (cardProbability < 0.4  || this.firstCard === true) {
    //   let colorCardProbability = Math.floor(Math.random() * 5);
    //   cardGenerated = this.colorCards[colorCardProbability];
    // } else if (cardProbability >= 0.4 && cardProbability < 0.9){
    //   let specialCardProbability = Math.floor(Math.random() * 2);
    //   cardGenerated = this.specialCards[specialCardProbability];
    // } else if (cardProbability >= 0.9 && cardProbability < 1) {
    //   cardGenerated = this.sunCard;
    // }

    this.xhtmlCard.src = `../images/${cardGenerated}.svg`;
    if (this.firstCard === true) {
      this.firstCard = false;
    }

    return cardGenerated;
  }

  changeImage() {
    this.cardName = this.generateCard();
  }

  /*
  * Cambia la imagen y nombre del objeto carta por el nombre espcífico que
  * viene en el parámetro card
  */
  setSpecificCard(card) {
    let cardGenerated = '';
    cardGenerated = this.colorCards[card - 1];

    this.xhtmlCard.src = `../images/${cardGenerated}.svg`;
    this.cardName = cardGenerated;
  }

  /*
  * Cambia la imagen y nombre del objeto carta por el una carta
  * de color aleatoria
  */
  setColorCard() {
    let cardGenerated = '';
    const colorCardProbability = Math.floor(Math.random() * 5);
    cardGenerated = this.colorCards[colorCardProbability];
    this.xhtmlCard.src = `../images/${cardGenerated}.svg`;
    this.cardName = cardGenerated;
  }
}
