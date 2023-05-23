export default class Owl {
  constructor(owlElement) {
    this.xhtmlOwl = owlElement;
    this.setInitialValues();
  }

  setInitialValues() {
    this.isPlaying = false;
    this.firstMoveCompleted = false;
    this.firstMove = true;
    this.cellsTraveled = 0;
    this.previousPosition = -1;
    this.insideNest = false;
    this.positionBeforeNest = -1;
    this.standBeforeNest = false;
    this.justPassing = false;

    this.xhtmlOwl.style.top = '0px';
    this.xhtmlOwl.style.left = '0px';
  }
}
