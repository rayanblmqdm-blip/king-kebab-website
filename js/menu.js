/* Menu interactivo - alimenté par Supabase */
const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let CATEGORIAS = [];

async function cargarCarta() {
  document.getElementById("menuList").innerHTML = `<p class="cat-nota">Cargando carta…</p>`;

  const { data: categorias, error: e1 } = await sbClient
    .from("categories").select("id,name,sort_order").order("sort_order");
  const { data: productos, error: e2 } = await sbClient
    .from("products").select("id,category_id,name,price,sort_order")
    .eq("is_available", true).order("sort_order");
  const { data: opciones, error: e3 } = await sbClient
    .from("product_options").select("id,product_id,option_type,label,price_delta");

  if (e1 || e2 || e3) {
    document.getElementById("menuList").innerHTML =
      `<p class="cat-nota">No se pudo cargar la carta. Comprueba tu conexión.</p>`;
    console.error(e1 || e2 || e3);
    return;
  }

  CATEGORIAS = categorias.map(cat => ({
    id: cat.id,
    nombre: cat.name,
    productos: productos
      .filter(p => p.category_id === cat.id)
      .map(p => {
        const tallas = opciones
          .filter(o => o.product_id === p.id && o.option_type === "size")
          .map(o => [o.label, o.price_delta]);
        const extras = opciones
          .filter(o => o.product_id === p.id && o.option_type === "extra")
          .map(o => ({ label: o.label, precio: o.price_delta }));
        return {
          nombre: p.name,
          precio: p.price,
          tallas: tallas.length ? tallas : null,
          extras: extras.length ? extras : null
        };
      })
  })).filter(cat => cat.productos.length > 0);

  renderTabs();
  if (CATEGORIAS.length) showCategoria(CATEGORIAS[0].id);
}

function renderTabs() {
  const tabs = document.getElementById("menuTabs");
  tabs.innerHTML = CATEGORIAS.map((c,i) =>
    `<button class="tab${i===0?' active':''}" data-cat="${c.id}">${c.nombre}</button>`
  ).join("");
  tabs.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabs.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      showCategoria(btn.dataset.cat);
    });
  });
}

function precioTexto(p) {
  if (p.precio !== null && p.precio !== undefined) return Number(p.precio).toFixed(2) + " €";
  if (p.tallas) return "desde " + Math.min(...p.tallas.map(t=>t[1])).toFixed(2) + " €";
  return "";
}

function showCategoria(catId) {
  const cat = CATEGORIAS.find(c=>c.id===catId);
  const wrap = document.getElementById("menuList");
  wrap.innerHTML = `<div class="prod-grid">` +
    cat.productos.map((p,i)=>`
      
