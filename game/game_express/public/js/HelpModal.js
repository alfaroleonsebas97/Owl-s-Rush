class HelpModal {
  constructor() {
    this.show = false;
    this.help_button_element = document.getElementsByClassName('help_button')[0];
    this.help_modal_element = document.getElementsByClassName('help_modal')[0];
  }

  // establece el evento para que se abra el modal al presionar el boton de ayuda.
  setModal() {
    this.help_button_element.addEventListener('click', () => {
      if (this.show === false) {
        this.help_modal_element.style.display = 'block';
        this.show = true;
        this.help_button_element.style.zIndex = '2';
      } else {
        this.help_modal_element.style.display = 'none';
        this.show = false;
      }
    });
  }
}

const helpModal = new HelpModal();
helpModal.setModal();
