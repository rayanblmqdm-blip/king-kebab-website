/* Carrito de compra - persiste pendant la navigation (sessionStorage) */
const ZONAS_ENTREGA = [
  { id:"rinconada", nombre:"La Rinconada", recargo:2.00 },
  { id:"sanjose",   nombre:"San José de la Rinconada", recargo:1.00 },
  { id:"jarilla",   nombre:"Jarilla", recargo:2.00 }
];
const DIRECCION_LOCAL = "Carretera Bética 109, 41300 San José de la Rinconada, Sevilla";

let carrito = JSON.parse(sessionStorage.getItem("kk_carrito") || "[]");
let entrega = JSON.parse(sessionStorage.getItem("kk_entrega") || '{"tipo":"recogida","zona":"","cliente":{}}');

function guardarEstado() {
  sessionStorage.setItem("kk_carrito", JSON.stringify(carrito));
  sessionStorage.setItem("kk_entrega", JSON.stringify(entrega));
}

function agregarAlCarrito(item) {
  carrito.push(item);
  guardarEstado();
  actualizarBadge();
  renderCarrito();
}

function eliminarDelCarrito(idx) {
  carrito.splice(idx, 1);
  guardarEstado();
  actualizarBadge();
  renderCarrito();
}

function cambiarCantidadCarrito(idx, delta) {
  carrito[idx].cantidad = Math.max(1, carrito[idx].cantidad + delta);
  guardarEstado();
  renderCarrito();
}

function actualizarBadge() {
  const total = carrito.reduce((s,i)=>s+i.cantidad, 0);
  document.querySelectorAll(".cart-badge").forEach(b=>{
    b.textContent = total;
    b.style.display = total > 0 ? "inline-flex" : "none";
  });
}

function subtotal() {
  return carrito.reduce((s,i)=> s + i.precioUnitario * i.cantidad, 0);
}

function recargoEntrega() {
  if (entrega.tipo !== "domicilio") return 0;
  const z = ZONAS_ENTREGA.find(z=>z.id===entrega.zona);
  return z ? z.recargo : 0;
}

function abrirCarrito() {
  renderCarrito();
  document.getElementById("cartDrawer").classList.add("open");
}
function cerrarCarrito() {
  document.getElementById("cartDrawer").classList.remove("open");
}

function elegirEntrega(tipo) {
  entrega.tipo = tipo;
  guardarEstado();
  renderCarrito();
}
function elegirZona(zonaId) {
  entrega.zona = zonaId;
  guardarEstado();
  renderCarrito();
}
function actualizarCliente(campo, valor) {
  entrega.cliente[campo] = valor;
  guardarEstado();
}

function renderCarrito() {
  const wrap = document.getElementById("cartDrawer");
  const sub = subtotal();
  const recargo = recargoEntrega();
  const total = sub + recargo;

  const itemsHtml = carrito.length === 0
    ? `<p class="cart-empty">Tu carrito está vacío. Añade productos desde el menú.</p>`
    : carrito.map((it,idx)=>`
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-nombre">${it.nombre}</span>
          ${it.detalle ? `<span class="cart-item-detalle">${it.detalle}</span>` : ""}
        </div>
        <div class="cart-item-qty">
          <button onclick="cambiarCantidadCarrito(${idx},-1)">−</button>
          <span>${it.cantidad}</span>
          <button onclick="cambiarCantidadCarrito(${idx},1)">+</button>
        </div>
        <span class="cart-item-precio">${(it.precioUnitario*it.cantidad).toFixed(2)} €</span>
        <span class="cart-item-del" onclick="eliminarDelCarrito(${idx})">🗑</span>
      </div>`).join("");

  const zonasHtml = ZONAS_ENTREGA.map(z=>`
    <label class="opt-row">
      <input type="radio" name="zona" value="${z.id}" ${entrega.zona===z.id?'checked':''} onchange="elegirZona('${z.id}')">
      ${z.nombre} — +${z.recargo.toFixed(2)} €
    </label>`).join("");

  const c = entrega.cliente || {};
  const formHtml = entrega.tipo === "domicilio" ? `
    <div class="opt-group">
      <p class="opt-title">Zona de entrega</p>
      ${zonasHtml}
    </div>
    <div class="opt-group cliente-form">
      <p class="opt-title">Tus datos</p>
      <input placeholder="Nombre" value="${c.nombre||''}" oninput="actualizarCliente('nombre',this.value)">
      <input placeholder="Apellido" value="${c.apellido||''}" oninput="actualizarCliente('apellido',this.value)">
      <input placeholder="Teléfono" value="${c.telefono||''}" oninput="actualizarCliente('telefono',this.value)">
      <input placeholder="Dirección" value="${c.direccion||''}" oninput="actualizarCliente('direccion',this.value)">
      <input placeholder="Ciudad" value="${c.ciudad||''}" oninput="actualizarCliente('ciudad',this.value)">
      <input placeholder="Código postal" value="${c.cp||''}" oninput="actualizarCliente('cp',this.value)">
      <textarea placeholder="Instrucciones de entrega" oninput="actualizarCliente('instrucciones',this.value)">${c.instrucciones||''}</textarea>
    </div>` : `
    <div class="opt-group">
      <p class="opt-title">Recoger en el local</p>
      <p class="pickup-address">📍 ${DIRECCION_LOCAL}</p>
      <input placeholder="Nombre" value="${c.nombre||''}" oninput="actualizarCliente('nombre',this.value)">
      <input placeholder="Teléfono" value="${c.telefono||''}" oninput="actualizarCliente('telefono',this.value)">
    </div>`;

  wrap.innerHTML = `
    <div class="cart-panel">
      <div class="cart-header">
        <h3>Mi pedido</h3>
        <span class="modal-close" onclick="cerrarCarrito()">&times;</span>
      </div>
      <div class="cart-items">${itemsHtml}</div>

      <div class="opt-group entrega-toggle">
        <button class="tab ${entrega.tipo==='recogida'?'active':''}" onclick="elegirEntrega('recogida')">Recogida en local</button>
        <button class="tab ${entrega.tipo==='domicilio'?'active':''}" onclick="elegirEntrega('domicilio')">Entrega a domicilio</button>
      </div>
      ${formHtml}

      <div class="cart-totales">
        <div><span>Subtotal</span><span>${sub.toFixed(2)} €</span></div>
        <div><span>Gastos de envío</span><span>${recargo.toFixed(2)} €</span></div>
        <div class="cart-total-final"><span>Total</span><span>${total.toFixed(2)} €</span></div>
      </div>
      <button class="btn btn-primary btn-add" ${carrito.length===0?'disabled':''} onclick="finalizarPedido()">Continuar con el pedido</button>
    </div>`;
}

function finalizarPedido() {
  alert("En la próxima etapa conectaremos el pedido a la base de datos y al pago (PayPal / efectivo).");
}

actualizarBadge();
