const productos = [
  {
    id: 1,
    nombre: "Guantes de Boxeo",
    precio: 150,
    categoria: "Guantes",
    img: "https://i.postimg.cc/Z51vGXrK/a-photograph-of-a-pair-of-blue-boxing-gl.jpg"
  },
  {
    id: 2,
    nombre: "Vendas para Manos",
    precio: 80,
    categoria: "Accesorios",
    img: "https://i.postimg.cc/LXvtFN9C/Gemini-Generated-Image-a91srsa91srsa91s.jpg"
  },
  {
    id: 3,
    nombre: "Protector Bucal",
    precio: 40,
    categoria: "Protección",
    img: "https://i.postimg.cc/VvVXdvbX/Gemini-Generated-Image-3i8c6h3i8c6h3i8c.jpg"
  },
  {
    id: 4,
    nombre: "Saco de Boxeo",
    precio: 220,
    categoria: "Accesorios",
    img: "https://i.postimg.cc/y8FSzvnm/Gemini-Generated-Image-63kfvw63kfvw63kf.jpg"
  },
  {
    id: 5,
    nombre: "Cuerda para Saltar",
    precio: 15,
    categoria: "Accesorios",
    img: "https://i.postimg.cc/bNnZQ377/Gemini-Generated-Image-i16qxli16qxli16q.jpg"
  },
  {
    id: 6,
    nombre: "Casco Protector",
    precio: 96,
    categoria: "Protección",
    img: "https://i.postimg.cc/rpRxzx1j/Gemini-Generated-Image-5238l15238l15238.jpg"
  },
  {
    id: 7,
    nombre: "Botas de Entrenamiento",
    precio: 90,
    categoria: "Protección",
    img: "https://i.postimg.cc/Gm1HzvrH/Gemini-Generated-Image-escov3escov3esco.jpg"
  }
];

let carrito = new Map();

const contenedorProductos = document.getElementById("productos");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const contenedorPayPal = document.getElementById("paypal-button-container");

function filtrarPorCategoria() {
  const seleccion = document.getElementById("categoria").value;
  const productosFiltrados =
    seleccion === "todos"
      ? productos
      : productos.filter((p) => p.categoria === seleccion);

  contenedorProductos.innerHTML = "";

  productosFiltrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.nombre}">
      <h3>${prod.nombre}</h3>
      <p>Precio: $${prod.precio.toFixed(2)}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(div);
  });
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  if (carrito.has(id)) {
    carrito.get(id).cantidad++;
  } else {
    carrito.set(id, { ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carrito.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nombre} - $${item.precio.toFixed(2)} x ${item.cantidad}
      <button onclick="eliminarDelCarrito(${item.id})">❌</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  totalCarrito.textContent = total.toFixed(2);
  cantidadCarrito.textContent = cantidadTotal;
  contenedorPayPal.style.display = carrito.size > 0 ? "block" : "none";
}

function eliminarDelCarrito(id) {
  if (!carrito.has(id)) return;

  let item = carrito.get(id);
  if (item.cantidad > 1) {
    item.cantidad--;
  } else {
    carrito.delete(id);
  }

  guardarCarrito();
  actualizarCarrito();
}

function vaciarCarrito() {
  if (carrito.size === 0) return;

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    carrito.clear();
    guardarCarrito();
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.size === 0) {
    alert("Tu carrito está vacío. Agrega productos antes de comprar.");
    return;
  }

  alert("¡Gracias por tu compra! 🥊 Tu pedido está en camino.");
  vaciarCarrito();
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

if (window.paypal) {
  paypal
    .Buttons({
      createOrder: function (data, actions) {
        const total = Array.from(carrito.values()).reduce(
          (acc, item) => acc + item.precio * item.cantidad,
          0
        );
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: total.toFixed(2)
              }
            }
          ]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          alert(`¡Gracias ${details.payer.name.given_name}, tu pago fue exitoso! 🥊`);
          vaciarCarrito();
        });
      },
      onError: function (err) {
        console.error("Error con PayPal:", err);
        alert("Hubo un problema con el pago. Intenta de nuevo.");
      }
    })
    .render("#paypal-button-container");
}

filtrarPorCategoria();
cargarCarrito();
