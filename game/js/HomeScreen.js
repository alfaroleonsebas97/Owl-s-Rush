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
