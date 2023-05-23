export default class Player {
  constructor(nickname, socket) {
    this.nickname = nickname;
    this.socket = socket;

    this.settingsName = ['option_X2Card', 'option_Rainbow', 'option_owls', 'option_cards'];
    this.settings = [1, 1, 4, 3];

    this.readyForGame = false;
    this.myScore = 0;
  }
}
