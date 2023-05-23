function main() {
  const client = new WebSocket(`ws://${window.location.host}`);
  window.localStorage.clear();
  const btnCreateLobby = document.getElementById('button_create_lobby');
  const btnJoinLobby = document.getElementById('button_join_lobby');
  const form = document.getElementById('form');
  let serverMessage = '';

  btnCreateLobby.onclick = () => {
    const nickname = document.getElementById('nickname').value;
    document.getElementById('nickname1').value = nickname;
    serverMessage = `{ "type": "createLobbyPetition", "nickname": "${nickname}"}`;
    client.send(serverMessage);

    client.addEventListener('message', (event) => {
      const messageInJSON = JSON.parse(event.data);
      // local Storage
      window.localStorage.setItem('playerId', messageInJSON.playerId);
      window.localStorage.setItem('sessionCode', messageInJSON.sessionCode);

      form.action = messageInJSON.xhtmlPage;
      document.getElementById('code').value = messageInJSON.sessionCode;
      document.getElementById('playerId').value = messageInJSON.playerId;

      form.submit();
    });
  };

  btnJoinLobby.onclick = () => {
    const nickname = document.getElementById('nickname').value;
    const code = document.getElementById('code').value;
    if (code && nickname) {
      serverMessage = `{ "type": "joinLobbyPetition", "nickname": "${nickname}", "sessionCode": "${code}" }`;
      client.send(serverMessage);

      client.addEventListener('message', (event) => {
        const messageInJSON = JSON.parse(event.data);

        if (messageInJSON.xhtmlPage == '/') {
          location.href = '/';
        } else {
          // local Storage
          window.localStorage.setItem('playerId', messageInJSON.playerId);
          window.localStorage.setItem('sessionCode', code);

          form.action = messageInJSON.xhtmlPage;
          document.getElementById('playerId').value = messageInJSON.playerId;

          for (let i = 0; i < messageInJSON.players.length; i += 1) {
            document.getElementById(`nickname${i + 1}`).value = messageInJSON.players[i].nickname;
          }
          document.getElementById(`nickname${messageInJSON.playerId}`).value = nickname;
          form.submit();
        }
      });
    }
  };

  /*--------------------------------------------------------------------*/
  const nicknameElement = document.getElementById('nickname');
  console.assert(nicknameElement);
  const nickname = window.localStorage.getItem('nickname');
  if (nickname) {
    nicknameElement.value = nickname;
  }
  nicknameElement.addEventListener('input', () => {
    window.localStorage.setItem('nickname', nicknameElement.value);
  });
  /*--------------------------------------------------------------------*/

  // -------------Creditos--------------
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
