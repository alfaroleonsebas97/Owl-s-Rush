function main() {
  const playerId = window.localStorage.getItem('playerId');
  const sessionCode = window.localStorage.getItem('sessionCode');
  const numMaxPlayers = 4;
  const form = document.querySelector('form');
  const btnStart = document.getElementById('button_start_game');
  const btnExitLobby = document.getElementById('button_exit_lobby');
  const settingsName = ['option_X2Card', 'option_Rainbow', 'option_owls', 'option_cards'];

  if (playerId != 1) {
    document.getElementById('div_button_to_start_game').style.display = 'none';
    document.getElementById('div_close_button').style.display = 'none';
  } else {
    document.getElementById('div_exit_button').style.display = 'none';
    document.getElementById('option_X2Card').removeAttribute('disabled');
    document.getElementById('option_Rainbow').removeAttribute('disabled');
    document.getElementById('option_owls').removeAttribute('disabled');
    document.getElementById('option_cards').removeAttribute('disabled');
  }
  document.getElementById(`nickname${playerId}`).style.fontWeight = 'bold';

  for (let i = 1; i <= playerId; i += 1) {
    document.getElementById(`img_owl${i}`).style.visibility = 'visible';
  }

  if (window.localStorage.getItem('numPlayers') != null) {
    for (let i = 1; i <= window.localStorage.getItem('numPlayers'); i += 1) {
      document.getElementById(`nickname${i}`).innerHTML = window.localStorage.getItem(`nickname${i}`);
      document.getElementById(`img_owl${i}`).style.visibility = 'visible';
    }
    document.getElementById(`sessionCode`).innerHTML = window.localStorage.getItem(`sessionCode`);
  }

  const client = new WebSocket(`ws://${window.location.host}`);

  client.addEventListener('open', () => {
    client.send(`{ "type": "changePlayerSocket", "sessionCode": "${sessionCode}", "playerId": "${playerId}", "xhtml": "LobbyScreen" }`);

    form.addEventListener('change', (event) => {
      let value = event.target.value;
      if (event.target.id == 'option_X2Card' || event.target.id == 'option_Rainbow') {
        if (document.getElementById(`${event.target.id}`).checked) {
          value = 1;
        } else {
          value = 0;
        }
      }
      client.send(`{ "type": "settingsChanged", "sessionCode": "${sessionCode}", "setting": "${event.target.id}", "value": "${value}" }`);
    });
  });

  client.addEventListener('close', () => {
    client.send(`{ "type": "abandon",  "playerId": "${playerId}", "sessionCode": "${sessionCode}" }`);
  });

  btnStart.onclick = () => {
    client.send(`{ "type": "startPetition", "sessionCode": "${sessionCode}" }`);
  };

  btnExitLobby.onclick = () => {
    client.send(`{ "type": "abandon",  "playerId": "${playerId}", "sessionCode": "${sessionCode}" }`);
  };

  client.addEventListener('message', (event) => {
    const messageInJSON = JSON.parse(event.data);

    switch (messageInJSON.type) {
      case 'startMatch':
        window.localStorage.setItem('option_X2Card', form.option_X2Card.checked);
        window.localStorage.setItem('option_Rainbow', form.option_Rainbow.checked);
        
        window.localStorage.setItem('owlsPerPlayer', form.owls_per_player.value);
        window.localStorage.setItem('cardsPerPlayer', form.cards_per_player.value);

        window.localStorage.setItem('numPlayers', messageInJSON.numPlayers);

        for (let i = 1; i <= parseInt(messageInJSON.numPlayers, 10); i+= 1) {
          window.localStorage.setItem(`nickname${i}`, `${document.getElementById(`nickname${i}`).innerHTML}`);
        }

        form.action = messageInJSON.xhtmlPage;
        form.submit();
        break;

      case "newPlayerJoined":
        document.getElementById(`nickname${messageInJSON.playerId}`).innerHTML = `${messageInJSON.nickname}`;
        document.getElementById(`img_owl${messageInJSON.playerId}`).style.visibility = 'visible';
        break;

      case 'actualSettings':
        for (let i = 0; i < messageInJSON.settings.length; i += 1) {
          if (settingsName[i] == 'option_X2Card' || settingsName[i] == 'option_Rainbow') {
            if (messageInJSON.settings[i].value == 0) {
              document.getElementById(`${settingsName[i]}`).checked = false
            } else {
              document.getElementById(`${settingsName[i]}`).checked = true;
            }
          } else {
            document.getElementById(`${settingsName[i]}`).value = messageInJSON.settings[i].value;
          } 
        }
        break;

      case 'newSettings':
        if (playerId != 1) {
          if (messageInJSON.setting == 'option_X2Card' || messageInJSON.setting == 'option_Rainbow') {
            if (document.getElementById(`${messageInJSON.setting}`).checked) {
              document.getElementById(`${messageInJSON.setting}`).checked = false
            } else {
              document.getElementById(`${messageInJSON.setting}`).checked = true;
            }
          } else {
            document.getElementById(`${messageInJSON.setting}`).value = messageInJSON.value;
          }
        }
        break;

      case 'hostAbandon':
        window.localStorage.clear();
        location.href = '/';
        
        break;

      case 'guestAbandon':
        if (messageInJSON.playerId < parseInt(window.localStorage.getItem('playerId'), 10)) {
          window.localStorage.setItem('playerId', parseInt(window.localStorage.getItem('playerId'), 10)-1)
        }
        for (let i = parseInt(messageInJSON.playerId, 10); i < numMaxPlayers; i++) {
          if (document.getElementById(`nickname${i + 1}`).innerHTML == '') {
            document.getElementById(`nickname${i}`).innerHTML = '';
            document.getElementById(`img_owl${i}`).style.visibility = 'hidden';  
          } else {
            document.getElementById(`nickname${i}`).innerHTML = document.getElementById(`nickname${i+1}`).innerHTML;
          }
        }
        if (parseInt(messageInJSON.playerId, 10) == numMaxPlayers) {
          document.getElementById(`nickname${numMaxPlayers}`).innerHTML = '';
          document.getElementById(`img_owl${numMaxPlayers}`).style.visibility = 'hidden'; 
        }


        break;

      case 'takeOutPlayer':
        location.href = '/';
        window.localStorage.clear();
        break;

      default:
        break;
    }
  });

  // Mensaje para el host del lobby (CLOSE LOBBY dentro de LobbyScreen)
  document.getElementById('button_close_lobby').addEventListener('click', () => {
    if (window.confirm('Are you sure you want close the lobby?')) { // eslint-disable-line no-alert
      client.send(`{ "type": "abandon",  "playerId": "${playerId}", "sessionCode": "${sessionCode}" }`);
    }
  });

  // -------------Creditos---------------
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
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

window.addEventListener('load', main);
