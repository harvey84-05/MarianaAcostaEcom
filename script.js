const productos = [
  { id: 1, nombre: "Guantes de Boxeo", precio: 150, categoria: "Guantes", img: "https://i.postimg.cc/Z51vGXrK/a-photograph-of-a-pair-of-blue-boxing-gl.jpg" },
  { id: 2, nombre: "Vendas para Manos", precio: 80, categoria: "Accesorios", img: "https://i.postimg.cc/LXvtFN9C/Gemini-Generated-Image-a91srsa91srsa91s.jpg" },
  { id: 3, nombre: "Protector Bucal", precio: 40, categoria: "Protección", img: "https://i.postimg.cc/VvVXdvbX/Gemini-Generated-Image-3i8c6h3i8c6h3i8c.jpg" },
  { id: 4, nombre: "Saco de Boxeo", precio: 220, categoria: "Accesorios", img: "https://i.postimg.cc/y8FSzvnm/Gemini-Generated-Image-63kfvw63kfvw63kf.jpg" },
  { id: 5, nombre: "Cuerda para Saltar", precio: 15, categoria: "Accesorios", img: "https://i.postimg.cc/bNnZQ377/Gemini-Generated-Image-i16qxli16qxli16q.jpg" },
  { id: 6, nombre: "Casco Protector", precio: 96, categoria: "Protección", img: "https://i.postimg.cc/rpRxzx1j/Gemini-Generated-Image-5238l15238l15238.jpg" },
  { id: 7, nombre: "Botas de Entrenamiento", precio: 90, categoria: "Protección", img: "https://i.postimg.cc/Gm1HzvrH/Gemini-Generated-Image-escov3escov3esco.jpg" }
];

let carrito = new Map();

function filtrarPorCategoria() {
  const categoria = document.getElementById("categoria").value;
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  const filtrados = categoria === "todos"
    ? productos
    : productos.filter(p => p.categoria === categoria);

  filtrados.forEach(prod => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>$${prod.precio}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedor.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
  mostrarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalEl = document.getElementById("total-carrito");
  const contador = document.getElementById("contador-carrito");
  const boton = document.getElementById("boton-comprar");

  lista.innerHTML = "";
  let total = 0;
  let cantidad = 0;

  carrito.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>`;
    lista.appendChild(li);
    total += item.precio * item.cantidad;
    cantidad += item.cantidad;
  });

  totalEl.textContent = total.toFixed(2);
  contador.textContent = cantidad;
  boton.style.display = carrito.size > 0 ? "block" : "none";
  document.getElementById("paypal-button-container").style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  item.cantidad--;
  if (item.cantidad <= 0) {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (confirm("¿Vaciar todo el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.size === 0) {
    alert("Carrito vacío.");
    return;
  }
  alert("¡Gracias por tu compra! 🥊");
  vaciarCarrito();
}

function mostrarCarrito() {
  document.getElementById("carrito-popup").classList.add("mostrar");
}

function cerrarCarrito() {
  document.getElementById("carrito-popup").classList.remove("mostrar");
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(Array.from(carrito.entries())));
}

function cargarCarrito() {
  const data = localStorage.getItem("carrito");
  if (data) {
    carrito = new Map(JSON.parse(data));
    actualizarCarrito();
  }
}

// PayPal
if (window.paypal) {
  paypal.Buttons({
    createOrder: function (data, actions) {
      const total = Array.from(carrito.values()).reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      return actions.order.create({
        purchase_units: [{
          amount: { value: total.toFixed(2) }
        }]
      });
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(details => {
        alert(`Gracias ${details.payer.name.given_name}, tu pago fue exitoso.`);
        vaciarCarrito();
      });
    },
    onError: function (err) {
      console.error(err);
      alert("Error con el pago.");
    }
  }).render('#paypal-button-container');
}

filtrarPorCategoria();
cargarCarrito();
