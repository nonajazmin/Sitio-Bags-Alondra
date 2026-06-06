// =============================================
//  CARRITO DE COMPRAS - main.js
// =============================================

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// =============================================
//  PÁGINA DE PRODUCTOS
// =============================================
function inicializarBotones() {
  const botones = document.querySelectorAll(".btn-agregar-carrito");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nombre = btn.dataset.nombre;
      const precio = parseFloat(btn.dataset.precio);
      const imagen = btn.dataset.imagen;
      agregarProducto({ nombre, precio, imagen });
    });
  });
}

function agregarProducto({ nombre, precio, imagen }) {
  const existe = carrito.find((p) => p.nombre === nombre);
  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ nombre, precio, imagen, cantidad: 1 });
  }
  guardarCarrito();
  mostrarNotificacion(nombre);
  actualizarContadorHeader();
}

function mostrarNotificacion(nombre) {
  const toastExistente = document.querySelector(".toast-carrito");
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement("div");
  toast.className = "toast-carrito";
  toast.innerHTML = `✓ <strong>${nombre}</strong> agregado al carrito`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function actualizarContadorHeader() {
  const contador = document.querySelector("#contador-carrito");
  if (!contador) return;
  const total = carrito.reduce((acc, p) => acc + p.cantidad, 0);
  contador.textContent = total;
  contador.style.display = total > 0 ? "inline-flex" : "none";
}

// =============================================
//  PÁGINA DEL CARRITO
// =============================================
function renderizarCarrito() {
  const contenedor = document.getElementById("productos-carrito");
  if (!contenedor) return;

  // Filtrar productos corruptos
  carrito = carrito.filter(p => p.nombre && p.precio && p.imagen && p.cantidad);
  guardarCarrito();

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío.</p>
        <a href="index.html" class="btn btn-dark">Ver productos</a>
      </div>`;
    actualizarResumen();
    return;
  }

  carrito.forEach((producto, index) => {
    const fila = document.createElement("div");
    fila.className = "fila-carrito";

    fila.innerHTML = `
      <div class="producto-carrito">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <span>${producto.nombre}</span>
      </div>

      <span class="celda">Por Definir</span>

      <span class="celda">$${formatearPrecio(producto.precio)}</span>

      <div class="cantidad-controles">
        <button onclick="cambiarCantidad(${index}, -1)">−</button>
        <span>${producto.cantidad}</span>
        <button onclick="cambiarCantidad(${index}, +1)">+</button>
      </div>

      <span class="celda-total">$${formatearPrecio(producto.precio * producto.cantidad)}</span>

      <button class="btn-eliminar-producto" onclick="eliminarProducto(${index})" title="Eliminar">✕</button>
    `;

    contenedor.appendChild(fila);
  });

  actualizarResumen();
}

function cambiarCantidad(index, delta) {
  carrito[index].cantidad += delta;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarCarrito();
  renderizarCarrito();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderizarCarrito();
}

function actualizarResumen() {
  const subtotal = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const spanSubtotal = document.getElementById("subtotal");
  const spanTotal    = document.getElementById("total");
  if (spanSubtotal) spanSubtotal.textContent = `$${formatearPrecio(subtotal)}`;
  if (spanTotal)    spanTotal.textContent    = `$${formatearPrecio(subtotal)}`;
}

function formatearPrecio(num) {
  return num.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ---------- Botón Finalizar ----------
function inicializarBtnFinalizar() {
  const btn = document.getElementById("btnFinalizar");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    alert("¡Compra finalizada! Gracias por tu pedido.");
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
  });
}
// =============================================
//  ANIMACIONES AL SCROLL
// =============================================
function inicializarAnimaciones() {
  const selectores = ['.card', '.hero-text', '.hero-img', 'h2', '.footer-col'];

  selectores.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('animar');
      if (sel === '.card' || sel === '.footer-col') {
        el.style.transitionDelay = `${i * 0.12}s`;
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.animar').forEach(el => observer.observe(el));
}

// =============================================
//  INICIO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarBotones();
  actualizarContadorHeader();
  renderizarCarrito();
  inicializarBtnFinalizar();
  inicializarAnimaciones();
  cargarPerfil();
});

// ─── Validación formulario de contacto ───
const rules = {
    nombre:   { pattern: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/, msg: 'Ingresa un nombre válido (mín. 2 letras).' },
    telefono: { pattern: /^\+?[\d\s\-(). ]{7,15}$/,        msg: 'Ingresa un teléfono válido (7-15 dígitos).' },
    correo:   { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,  msg: 'Ingresa un correo electrónico válido.' },
    asunto:   { pattern: /^.{3,}$/,                         msg: 'El asunto debe tener al menos 3 caracteres.' },
    mensaje:  { pattern: /^[\s\S]{10,1000}$/,               msg: 'El mensaje debe tener entre 10 y 1000 caracteres.' }
};

function validarCampo(id) {
    const el  = document.getElementById(id);
    const err = document.getElementById('e-' + id);
    if (!el || !err) return true; // si no está en esta página, ignorar
    const val = el.value.trim();
    const ok  = val !== '' && rules[id].pattern.test(val);

    el.classList.toggle('campo-error', !ok);
    el.classList.toggle('campo-ok', ok);
    err.style.display = ok ? 'none' : 'block';
    err.textContent   = ok ? '' : (val === '' ? 'Este campo es obligatorio.' : rules[id].msg);
    return ok;
}

// Activar listeners solo si estamos en la página de contacto
document.addEventListener('DOMContentLoaded', () => {
    Object.keys(rules).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('blur',  () => validarCampo(id));
        el.addEventListener('input', () => validarCampo(id));
    });
});

function enviarFormulario() {
    const validos = Object.keys(rules).map(id => validarCampo(id));
    if (validos.every(Boolean)) {
        alert('¡Mensaje enviado correctamente!');
        Object.keys(rules).forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.value = ''; el.classList.remove('campo-ok'); }
        });
    } else {
        const primero = Object.keys(rules).find((id, i) => !validos[i]);
        document.getElementById(primero)?.focus();
    }
}
// =============================================
//  PERFIL DE USUARIO
// =============================================
function guardarPerfil() {
    const nombre    = document.getElementById("p-nombre").value.trim();
    const email     = document.getElementById("p-email").value.trim();
    const direccion = document.getElementById("p-direccion").value.trim();
    const telefono  = document.getElementById("p-telefono").value.trim();
    const genero    = document.querySelector('input[name="genero"]:checked');

    if (!nombre || !email) {
        alert("Por favor completa al menos tu nombre y correo.");
        return;
    }

    // Guardar en localStorage
    const perfil = { nombre, email, direccion, telefono,
                     genero: genero ? genero.value : "" };
    localStorage.setItem("perfil", JSON.stringify(perfil));

    // Actualizar tarjeta
    actualizarTarjetaPerfil(perfil);
    alert("¡Perfil guardado correctamente!");
}

function actualizarTarjetaPerfil(perfil) {
    const elNombre = document.getElementById("tarjeta-nombre");
    const elEmail  = document.getElementById("tarjeta-email");
    const inicial  = document.getElementById("avatar-inicial");

    if (elNombre) elNombre.textContent = perfil.nombre || "Tu nombre";
    if (elEmail)  elEmail.textContent  = perfil.email  || "tu@correo.com";
    if (inicial)  inicial.textContent  = perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : "?";
}

function cambiarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img     = document.getElementById("avatar-img");
        const inicial = document.getElementById("avatar-inicial");
        img.src = e.target.result;
        img.style.display = "block";
        inicial.style.display = "none";
        localStorage.setItem("avatar", e.target.result);
    };
    reader.readAsDataURL(file);
}

function cargarPerfil() {
    const perfil = JSON.parse(localStorage.getItem("perfil"));
    const avatar = localStorage.getItem("avatar");

    if (perfil) {
        const campos = {
            "p-nombre":    perfil.nombre,
            "p-email":     perfil.email,
            "p-direccion": perfil.direccion,
            "p-telefono":  perfil.telefono,
        };
        Object.entries(campos).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el && val) el.value = val;
        });
        if (perfil.genero) {
            const radio = document.querySelector(`input[name="genero"][value="${perfil.genero}"]`);
            if (radio) radio.checked = true;
        }
        actualizarTarjetaPerfil(perfil);
    }

    if (avatar) {
        const img     = document.getElementById("avatar-img");
        const inicial = document.getElementById("avatar-inicial");
        if (img) {
            img.src = avatar;
            img.style.display = "block";
            if (inicial) inicial.style.display = "none";
        }
    }
}





