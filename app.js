(function(){
  const CURRENCY = "$";
  const STORAGE_CART = "ataraxia_cart";
  const STORAGE_ORDER = "ataraxia_order";

  // Versionado para limpiar carritos viejos una sola vez
  const STORAGE_VER_KEY = "ataraxia_ver";
  const STORAGE_VERSION = "2";
  function ensureVersion(){
    if (localStorage.getItem(STORAGE_VER_KEY) !== STORAGE_VERSION){
      localStorage.removeItem(STORAGE_CART);
      localStorage.setItem(STORAGE_VER_KEY, STORAGE_VERSION);
    }
  }

  const products = [
    // Bebidas
    { id:"bev_cortado", name:"Café cortado", price:1800, category:"Bebidas", img:"assets/imgs/bev_cortado.jpg", emoji:"☕", desc:"Espresso con un toque de leche." },
    { id:"bev_iced_latte", name:"Iced latte", price:2200, category:"Bebidas", img:"assets/imgs/bev_iced_latte.jpg", emoji:"🧊", desc:"Café frío con leche y hielo." },
    { id:"bev_matcha_latte", name:"Matcha latte", price:2500, category:"Bebidas", img:"assets/imgs/bev_matcha_latte.jpg", emoji:"🍵", desc:"Matcha premium con leche." },
    { id:"bev_con_leche", name:"Café con leche", price:1900, category:"Bebidas", img:"assets/imgs/bev_con_leche.jpg", emoji:"🥛", desc:"Clásico y cremoso." },
    { id:"bev_cappuccino", name:"Cappuccino", price:2300, category:"Bebidas", img:"assets/imgs/bev_cappuccino.jpg", emoji:"☁️", desc:"Espuma aterciopelada." },
    { id:"bev_submarino", name:"Submarino", price:2400, category:"Bebidas", img:"assets/imgs/bev_submarino.jpg", emoji:"🍫", desc:"Leche caliente + tableta de chocolate." },

    // Comidas
    { id:"food_torta_choco", name:"Torta de chocolate", price:2600, category:"Comidas", img:"assets/imgs/food_torta_choco.jpg", emoji:"🍰", desc:"Húmeda y chocolatosa." },
    { id:"food_croissant", name:"Croissant", price:1500, category:"Comidas", img:"assets/imgs/food_croissant.jpg", emoji:"🥐", desc:"Mantecoso, recién horneado." },
    { id:"food_galleta_avena", name:"Galletitas de avena", price:1200, category:"Comidas", img:"assets/imgs/food_galleta_avena.jpg", emoji:"🍪", desc:"Crujientes y caseras." },
    { id:"food_budin_limon", name:"Budín de limón", price:1800, category:"Comidas", img:"assets/imgs/food_budin_limon.jpg", emoji:"🍋", desc:"Glaseado suave." },
    { id:"food_budin_vainilla", name:"Budín de vainilla", price:1750, category:"Comidas", img:"assets/imgs/food_budin_vainilla.jpg", emoji:"🧁", desc:"Clásico y esponjoso." },
    { id:"food_roll_canela", name:"Roll de canela", price:2100, category:"Comidas", img:"assets/imgs/food_roll_canela.jpg", emoji:"🥯", desc:"Aromático y tibio." },
  ];

  function mediaHTML(p){
    return p.img ? (
      '<div class="card-media"><img src="'+p.img+'" alt="'+p.name+'"/></div>'
    ) : (
      '<div class="card-media">'+(p.emoji||'☕')+'</div>'
    );
  }

  function loadCart(){ try { return JSON.parse(localStorage.getItem(STORAGE_CART))||[]; } catch(e){ return []; } }
  function saveCart(cart){ localStorage.setItem(STORAGE_CART, JSON.stringify(cart)); }
  function getCartCount(){ return loadCart().reduce(function(a,i){return a+i.qty;},0); }
  function money(n){ return CURRENCY + new Intl.NumberFormat('es-AR').format(n); }
  function findProduct(id){ for (var i=0;i<products.length;i++){ if(products[i].id===id) return products[i]; } return null; }

  function addToCart(id){ var c=loadCart(); var idx=-1; for(var i=0;i<c.length;i++){ if(c[i].id===id){ idx=i; break; } }
    if(idx>-1) c[idx].qty+=1; else c.push({id:id, qty:1}); saveCart(c); updateCartBadges(); }
  function updateQty(id, d){ var c=loadCart(); var idx=-1; for(var i=0;i<c.length;i++){ if(c[i].id===id){ idx=i; break; } }
    if(idx>-1){ c[idx].qty+=d; if(c[idx].qty<=0) c.splice(idx,1); saveCart(c); renderCartPage(); updateCartBadges(); } }
  function clearCart(){ localStorage.removeItem(STORAGE_CART); renderCartPage(); updateCartBadges(); }
  function removeItem(id){ var c=loadCart().filter(function(i){return i.id!==id;}); saveCart(c); renderCartPage(); updateCartBadges(); }
  function calcTotals(){ var c=loadCart(); var subtotal=0; c.forEach(function(i){ var p=findProduct(i.id); subtotal += (p?p.price:0)*i.qty; }); var shipping=subtotal>0?Math.min(800, Math.round(subtotal*0.08)):0; return {subtotal:subtotal, shipping:shipping, total:subtotal+shipping}; }

  function renderCatalog(){ var bev=document.getElementById('beveragesGrid'); var food=document.getElementById('foodsGrid'); if(!bev||!food) return;
    function card(p){ var el=document.createElement('article'); el.className='card'; el.innerHTML = mediaHTML(p)+
      '<div class="card-body">'+
      '  <div class="card-title">'+p.name+'</div>'+
      '  <div class="card-desc">'+p.desc+'</div>'+
      '  <div class="card-actions">'+
      '    <span class="price">'+money(p.price)+'</span>'+
      '    <button class="btn" data-add="'+p.id+'">Agregar</button>'+
      '  </div>'+
      '</div>'; return el; }
    products.forEach(function(p){ if(p.category==='Bebidas') bev.appendChild(card(p)); });
    products.forEach(function(p){ if(p.category==='Comidas') food.appendChild(card(p)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-add]'), function(btn){ btn.addEventListener('click', function(){ addToCart(btn.getAttribute('data-add')); }); });
  }

  function renderCartPage(){ var list=document.getElementById('cartList'); if(!list) return; list.innerHTML=''; var cart=loadCart();
    if(cart.length===0){ list.innerHTML='<div class="empty">Tu carrito está vacío. <a href="index.html">Explorar productos</a></div>'; }
    else { cart.forEach(function(it){ var p=findProduct(it.id); if(!p) return; var img = p.img?'<img src="'+p.img+'" alt="'+p.name+'"/>' : ''; var el=document.createElement('div'); el.className='cart-item'; el.innerHTML=
        '<div class="thumb">'+img+'</div>'+
        '<div>'+
        '  <div class="title">'+p.name+'</div>'+
        '  <div class="price">'+money(p.price)+'</div>'+
        '  <div class="qty">'+
        '    <button data-delta="-1" data-id="'+p.id+'">−</button>'+
        '    <strong>'+it.qty+'</strong>'+
        '    <button data-delta="1" data-id="'+p.id+'">+</button>'+
        '    <span class="remove" data-remove="'+p.id+'">Eliminar</span>'+
        '  </div>'+
        '</div>'+
        '<div><strong>'+money(p.price*it.qty)+'</strong></div>'; list.appendChild(el); }); }
    var t=calcTotals(); ['summarySubtotal','summaryShipping','summaryTotal'].forEach(function(id){ var el=document.getElementById(id); if(!el) return; if(id==='summarySubtotal') el.textContent=money(t.subtotal); if(id==='summaryShipping') el.textContent=money(t.shipping); if(id==='summaryTotal') el.textContent=money(t.total); });
    Array.prototype.forEach.call(list.querySelectorAll('[data-delta]'), function(b){ b.addEventListener('click', function(){ updateQty(b.getAttribute('data-id'), Number(b.getAttribute('data-delta'))); }); });
    Array.prototype.forEach.call(list.querySelectorAll('[data-remove]'), function(a){ a.addEventListener('click', function(){ removeItem(a.getAttribute('data-remove')); }); });
    var clearBtn=document.getElementById('clearCartBtn'); if(clearBtn) clearBtn.onclick=clearCart;
  }

  function handleCheckout(){ var form=document.getElementById('shippingForm'); if(!form) return; form.addEventListener('submit', function(ev){ ev.preventDefault(); var fd=new FormData(form); var data={}; fd.forEach(function(v,k){data[k]=v;}); var cart=loadCart(); if(cart.length===0){ alert('Tu carrito está vacío'); return; } var totals=calcTotals(); var id='AX-'+Math.random().toString(36).slice(2,8).toUpperCase(); var now=new Date(); var order={ id:id, createdAt:now.toISOString(), items:cart.map(function(i){return {id:i.id, qty:i.qty, product:findProduct(i.id)};}), totals:totals, shipping:{recipient:data.recipient, address:data.address, phone:data.phone, notes:data.notes||''}, status:[ {key:'confirmado', label:'Pedido confirmado', time:now.toISOString()}, {key:'preparando', label:'Preparando tu pedido', time:null}, {key:'en_camino', label:'En camino', time:null}, {key:'entregado', label:'Entregado', time:null} ] }; localStorage.setItem(STORAGE_ORDER, JSON.stringify(order)); localStorage.removeItem(STORAGE_CART); location.href='tracking.html?id='+id; }); }

  function getOrder(){ try { return JSON.parse(localStorage.getItem(STORAGE_ORDER)); } catch(e){ return null; } }
  function currentStatus(order){ var last=order.status[0]; for(var i=0;i<order.status.length;i++){ if(order.status[i].time){ last=order.status[i]; } } return last; }
  function drawTimeline(order){ var tl=document.getElementById('timeline'); tl.innerHTML=''; var cur=currentStatus(order).key; order.status.forEach(function(s){ var active=s.time?'active':''; var t=s.time? new Date(s.time).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}) : '—'; var el=document.createElement('div'); el.className='step'; el.innerHTML='<div class="dot '+active+'">✓</div><div class="step-body"><div class="step-title">'+s.label+(s.key===cur?' (actual)':'')+'</div><div class="step-time">'+t+'</div></div>'; tl.appendChild(el); }); var st=document.getElementById('orderStatus'); if(st) st.textContent=currentStatus(order).label; }
  function drawOrderDetails(order){ var box=document.getElementById('orderDetails'); if(!box) return; var items=order.items.map(function(i){ return '<li><span>'+i.product.name+' × '+i.qty+'</span><strong>'+money(i.product.price*i.qty)+'</strong></li>'; }).join(''); box.innerHTML='<h2>Resumen</h2><ul class="order-items">'+items+'</ul>'+
    '<div class="row" style="margin-top:8px; display:flex; justify-content:space-between;"><span>Subtotal</span><strong>'+money(order.totals.subtotal)+'</strong></div>'+
    '<div class="row" style="display:flex; justify-content:space-between;"><span>Envío</span><strong>'+money(order.totals.shipping)+'</strong></div>'+
    '<div class="row" style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed rgba(0,0,0,.15); padding-top:6px;"><span>Total</span><strong>'+money(order.totals.total)+'</strong></div>'+
    '<h3 style="margin-top:12px;">Entrega</h3><p><strong>'+order.shipping.recipient+'</strong> — '+order.shipping.address+'<br>Tel: '+order.shipping.phone+'<br>'+(order.shipping.notes?('Notas: '+order.shipping.notes):'')+'</p>'; }
  function autoProgress(order){ if(order.status[order.status.length-1].time) return; var firstUnset=-1; for(var i=0;i<order.status.length;i++){ if(!order.status[i].time){ firstUnset=i; break; } } if(firstUnset>0) return; var delays=[0,4000,8000,12000]; order.status.forEach(function(_,idx){ setTimeout(function(){ if(!order.status[idx].time){ order.status[idx].time=new Date().toISOString(); localStorage.setItem(STORAGE_ORDER, JSON.stringify(order)); drawTimeline(order); } }, delays[idx]); }); }
  function renderTracking(){ var tl=document.getElementById('timeline'); if(!tl) return; var order=getOrder(); if(!order){ tl.innerHTML='<p>No encontramos un pedido reciente.</p>'; return; } var idEl=document.getElementById('orderId'); if(idEl) idEl.textContent=order.id; autoProgress(order); drawTimeline(order); drawOrderDetails(order); }

  function updateCartBadges(){ var c=getCartCount(); var h=document.getElementById('headerCartCount'); var f=document.getElementById('fabCartCount'); if(h) h.textContent=c; if(f) f.textContent=c; }
  function setYear(){ var yEls=document.querySelectorAll('#year'); var y=new Date().getFullYear(); Array.prototype.forEach.call(yEls, function(el){ el.textContent=y; }); }

  function boot(){ ensureVersion(); setYear(); updateCartBadges(); var page=document.body.getAttribute('data-page'); if(page==='catalog') renderCatalog(); if(page==='cart') renderCartPage(); if(page==='checkout') handleCheckout(); if(page==='tracking') renderTracking(); }
  document.addEventListener('DOMContentLoaded', boot);
})();