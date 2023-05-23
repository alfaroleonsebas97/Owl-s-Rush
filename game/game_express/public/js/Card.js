export default class Card {
  constructor(cardElement) {
    this.colorCards = ['card_red', 'card_lightblue', 'card_yellow', 'card_purple', 'card_green'];
    this.specialCards = ['special_card_x2', 'special_card_rainbow', 'special_card_swap', 'special_card_rollback'];
    this.sunCard = 'card_sun';
    this.firstCard = true;

    this.settingX2Card = window.localStorage.getItem('option_X2Card');
    this.settingRainbowCard = window.localStorage.getItem('option_Rainbow');
    
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

      if (this.settingX2Card == 'false' && this.settingRainbowCard == 'false'){
        const colorCardProbability = Math.floor(Math.random() * 5);
        cardGenerated = this.colorCards[colorCardProbability];
      }else if (this.settingRainbowCard == 'false') {
        cardGenerated = this.specialCards[0];
      }else if (this.settingX2Card == 'false'){
        cardGenerated = this.specialCards[1];
      }else {
        const specialCardProbability = Math.floor(Math.random() * 2);
        cardGenerated = this.specialCards[specialCardProbability];
      }
    } else if (cardProbability >= 0.85 && cardProbability < 1) {
      cardGenerated = this.sunCard;
    }

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
  * Cambia la imagen y nombre del objeto carta por la correspondiente al
  * número que viene en el parámetro card
  */
  setSpecificCard(card) {
    let cardGenerated = '';
    cardGenerated = this.colorCards[card - 1];

    this.xhtmlCard.src = `../images/${cardGenerated}.svg`;
    this.cardName = cardGenerated;
  }

  /*
  * Cambia la imagen y nombre del objeto carta por el nombre espcífico que
  * viene en el parámetro card
  */
  setSpecificCardByName(newCardName) {
    this.xhtmlCard.src = `../images/${newCardName}.svg`;
    this.cardName = newCardName;
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
