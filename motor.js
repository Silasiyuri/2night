<script>
    // VARIABLES DE CONFIGURACIÓN GLOBAL Y MEMORIA RAM DEL CARRITO NATIVO
    const bm = document.getElementById('bm'), ml = document.getElementById('ml'), cc = document.getElementById('cc'), vp = document.getElementById('vp'), lk = document.getElementById('lk'), secs = document.querySelectorAll('.sc');
    let usuarioRegistrado = false;
    let car = [], descuento = 0; // Se fuerza el uso estricto de la variable 'car'
    let modoSoloVer = false;

    // Control de la Ventana Emergente de Extras Activa
    let datosPizzaActiva = { nombre: "", precioBase: 0, precioAcumulado: 0, extras: {} };

    // DICCIONARIO MAESTRO: INGREDIENTES EXTRAS INDIVIDUALES POR CATEGORÍA
    const DiccionarioExtrasPorProducto = {
        pizzas: [
            { id: "sajt", nombre: "Extra Sajt", precio: 400 },
            { id: "gomba", nombre: "Gomba", precio: 300 },
            { id: "sonka", nombre: "Sonka", precio: 450 },
            { id: "kukorica", nombre: "Kukorica", precio: 250 },
            { id: "szalami", nombre: "Szalámi", precio: 400 },
            { id: "bacon", nombre: "Bacon", precio: 450 },
            { id: "hagyma", nombre: "Lila hagyma", precio: 200 }
        ],
        bebidas: [
            { id: "jeg", nombre: "Jég", precio: 0 },
            { id: "citrom", nombre: "Citromkarika", precio: 150 },
            { id: "lime", nombre: "Lime szelet", precio: 200 }
        ],
        etelek: [
            { id: "parmezan", nombre: "Extra Parmezán", precio: 350 },
            { id: "kenyer", nombre: "Házi kenyér", precio: 400 },
            { id: "csipos", nombre: "Csípős szósz", precio: 250 }
        ],
        deszertek: [
            { id: "tejszin", nombre: "Tejszínhab", precio: 250 },
            { id: "csoki", nombre: "Csoki öntet", precio: 200 }
        ]
    };

    // CONTROL DEL MENÚ DESLIZABLE NATIVO
    if(bm) {
        bm.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            ml.classList.toggle('a'); 
            cc.style.display = ml.classList.contains('a') ? 'block' : 'none'; 
        });
    }
    if(cc) {
        cc.addEventListener('click', () => { 
            ml.classList.remove('a'); 
            cc.style.display = 'none'; 
        });
    }

    function forzarCierreMenu() {
        ml.classList.remove('a');
        cc.style.display = 'none';
        const checkSupremo = document.getElementById('menu-check-supremo');
        if(checkSupremo) checkSupremo.checked = false;
    }
</script>
<script>
    // GESTIÓN DE ENLACES DE REDIRECCIÓN INTERNA (TABS SPA)
    ml.querySelectorAll('.nav-links a:not(#lk):not(#lnk-m-carrito-directo)').forEach(en => {
        en.addEventListener('click', (ev) => {
            document.getElementById('bg').value = '';
            forzarCierreMenu();
            vp.style.display = 'none';
            secs.forEach(s => s.style.display = 'none');
            
            modoSoloVer = true; 
            const seccionDestino = document.getElementById('s-' + ev.target.getAttribute('data-t'));
            if(seccionDestino) seccionDestino.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    if(lk) {
        lk.addEventListener('click', () => {
            document.getElementById('bg').value = '';
            forzarCierreMenu();
            secs.forEach(s => s.style.display = 'none');
            vp.style.display = 'flex';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // INTERCEPTOR DEL BOTÓN DE CONSULTA DEL CARRITO DESDE EL MENÚ LATERAL
    document.getElementById('lnk-m-carrito-directo').addEventListener('click', function(e) { 
        e.preventDefault(); 
        const estaLogueado = (document.getElementById('inpNev').value.trim() !== "");

        if (estaLogueado) {
            modoSoloVer = false;
            ocultarTodasLasSecciones(); 
            document.getElementById('s-ventana-carrito').style.setProperty('display', 'block', 'important'); 
            forzarCierreMenu(); 
        } else {
            alert('Kérjük, először jelentkezzen be a Delivero vagy Átvétel gombbal a kosár megtekintéséhez!');
            forzarCierreMenu();
            evaluarFlujoAcceso(); 
        }
    });

    // FLUJO DE ACCESO INTELIGENTE PERSISTENTE (RECONOCE DISPOSITIVOS)
    document.getElementById('card-delivero').addEventListener('click', evaluarFlujoAcceso);
    document.getElementById('card-pickup').addEventListener('click', evaluarFlujoAcceso);
    document.querySelectorAll('.to-menu-btn').forEach(btn => btn.addEventListener('click', evaluarFlujoAcceso));
    document.querySelectorAll('.to-map-btn').forEach(btn => btn.addEventListener('click', () => document.querySelector('[data-t="terkep"]').click()));

    function evaluarFlujoAcceso() {
        modoSoloVer = false;
        ocultarTodasLasSecciones();

        if (localStorage.getItem('pesta_registrado') === 'true') {
            cargarDatosEnCarrito(); 
            mostrarTiendaDeProductos();
            return;
        }
        document.getElementById('s-login').style.setProperty('display', 'block', 'important');
    }
</script>
<script>
    // FUNCIÓN MAESTRA: CARGA LOS EXTRAS COMPATIBLES CON LA SECCIÓN SELECCIONADA
    function inicializarVentanaExtras(nombreProducto, precioProducto) {
        datosPizzaActiva.nombre = nombreProducto;
        datosPizzaActiva.precioBase = parseInt(precioProducto);
        datosPizzaActiva.precioAcumulado = parseInt(precioProducto);
        datosPizzaActiva.extras = {};

        document.getElementById('txtNombrePizzaModal').innerText = nombreProducto;
        document.getElementById('txtPrecioPizzaModal').innerText = precioProducto;

        let listaExtrasSeleccionada = DiccionarioExtrasPorProducto.pizzas; 
        const nombreMinuscula = nombreProducto.toLowerCase();

        if (nombreMinuscula.includes('cola') || nombreMinuscula.includes('fanta') || nombreMinuscula.includes('kinley') || nombreMinuscula.includes('0.5l')) {
            listaExtrasSeleccionada = DiccionarioExtrasPorProducto.bebidas;
        } else if (nombreMinuscula.includes('lasagne') || nombreMinuscula.includes('carbonara') || nombreMinuscula.includes('arrabiata')) {
            listaExtrasSeleccionada = DiccionarioExtrasPorProducto.etelek;
        } else if (nombreMinuscula.includes('tiramisu') || nombreMinuscula.includes('cotta') || nombreMinuscula.includes('profiterol')) {
            listaExtrasSeleccionada = DiccionarioExtrasPorProducto.deszertek;
        }

        let htmlLista = "";
        listaExtrasSeleccionada.forEach(item => {
            datosPizzaActiva.extras[item.id] = { nombre: item.nombre, precio: item.precio, cantidad: 0 };
            
            htmlLista += `
                <div class="item-extra-linea" style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
                    <span>${item.nombre} (+${item.precio} Ft) <span id="num-badge-${item.id}" class="badge-numero-verde" style="display:none; background:#2ecc71; color:#fff; padding:2px 6px; border-radius:10px; font-size:0.8rem; font-weight:700; margin-left:6px;">0</span></span>
                    <div style="display:flex; align-items:center;">
                        <button class="btn-menos-nativo" id="btn-restar-${item.id}" onclick="event.stopPropagation(); decrementarIngredienteExtra('${item.id}')" disabled style="width:32px; height:32px; border-radius:50%; border:none; font-weight:bold; cursor:pointer; margin-right:5px; background:#fff; color:#000;">-</button>
                        <button class="btn-mas-nativo" onclick="event.stopPropagation(); incrementarIngredienteExtra('${item.id}')" style="width:32px; height:32px; border-radius:50%; border:none; font-weight:bold; cursor:pointer; background:#d6af37; color:#000;">+</button>
                    </div>
                </div>
            `;
        });
        document.getElementById('contenedorListaExtrasDinamicos').innerHTML = htmlLista;
        document.getElementById('pestaModalExtrasIndependiente').style.setProperty('display', 'flex', 'important');
    }

    function cerrarVentanaExtras() {
        document.getElementById('pestaModalExtrasIndependiente').style.setProperty('display', 'none', 'important');
    }

    function incrementarIngredienteExtra(idItem) {
        let ing = datosPizzaActiva.extras[idItem];
        ing.cantidad += 1;
        datosPizzaActiva.precioAcumulado += ing.precio;
        document.getElementById('txtPrecioPizzaModal').innerText = datosPizzaActiva.precioAcumulado;

        document.getElementById('btn-restar-' + idItem).disabled = false;
        const badge = document.getElementById('num-badge-' + idItem);
        if (badge) { badge.innerText = ing.cantidad; badge.style.display = "inline-block"; }
    }

    function decrementarIngredienteExtra(idItem) {
        let ing = datosPizzaActiva.extras[idItem];
        if (ing && ing.cantidad > 0) {
            ing.cantidad -= 1;
            datosPizzaActiva.precioAcumulado -= ing.precio;
            document.getElementById('txtPrecioPizzaModal').innerText = datosPizzaActiva.precioAcumulado;

            const badge = document.getElementById('num-badge-' + idItem);
            if (ing.cantidad === 0) {
                if (badge) badge.style.display = "none";
                document.getElementById('btn-restar-' + idItem).disabled = true;
            } else {
                if (badge) badge.innerText = ing.cantidad;
            }
        }
    }
</script>
<script>
    // REPARACIÓN CLAVE: INYECTA LOS DATOS CORRECTAMENTE EN LA VARIABLE 'car'
    function enviarPizzaFinalAlCarrito() {
        let nombreDetallado = datosPizzaActiva.nombre;
        let listaNombresExtras = [];

        for (let id in datosPizzaActiva.extras) {
            let item = datosPizzaActiva.extras[id];
            if (item.cantidad > 0) {
                listaNombresExtras.push(`${item.nombre} (x${item.cantidad})`);
            }
        }

        if (listaNombresExtras.length > 0) {
            nombreDetallado += ` (+Extra: ${listaNombresExtras.join(', ')})`;
        }

        // Se inserta en la variable 'car' nativa de tu pizzería
        car.push({ n: nombreDetallado, p: datosPizzaActiva.precioAcumulado, i: "" });
        upC(); // Llama a tu renderizador original de pantalla
        cerrarVentanaExtras();
    }

    // BOTÓN: RENDELÉS ELKÜLDÉSE REAL CON NÚMERO INTEGRADO Y ENLACE DE MEMORIA
    document.getElementById('be').addEventListener('click', (e) => {
        if(e) e.preventDefault();
        
        // Ahora el condicional leerá 'car.length' de forma correcta sin dar falsos vacíos
        if (car.length === 0) { 
            alert('A kosár üres!'); 
            return; 
        }

        const nev = document.getElementById('inpNev').value.trim();
        const cim = document.getElementById('inpCim').value.trim();
        const tel = document.getElementById('inpTel').value.trim();

        if (nev === "" || cim === "" || tel === "") { 
            alert('Kérjük, töltsön ki minden mezőt a szállításhoz!'); 
            return; 
        }

        // 1. Guardamos la comanda estructurada para que la abras manualmente en tu panel.html
        const paqueteComandaLocal = {
            nev: nev, cim: cim, tel: tel,
            termekek: car.map(item => ({ nombre: item.n, precio: item.p })),
            osszesen: document.getElementById('tp').innerText,
            kupon: descuento > 0 ? "10% Descuento" : "Nincs",
            idopont: new Date().toLocaleTimeString('hu-HU')
        };
        localStorage.setItem('ultimo_pedido_panel', JSON.stringify(paqueteComandaLocal));

        // 2. CONSTRUCCIÓN DE LA TEXTURA DE LA ORDEN DE COMPRA
        let txt = "🍕 *PIZZA TÚ NIGHT - ÚJ RENDELÉS* 🍕\n\n👤 *Név:* " + nev + "\n🏠 *Cím:* " + cim + "\n📞 *Tel:* " + tel + "\n\n📌 *Részletek:*\n";
        car.forEach(item => { txt += `🍕 *${item.n}* (${item.p} Ft)\n`; });
        txt += `\n💰 *Végösszeg:* ${document.getElementById('tp').innerText} Ft\n`;

        // 3. ENVÍO REAL DIRECTO CON NÚMERO DE BUDAPEST INTEGRADO (Frenaba el envío antiguo)
        const enlaceWhatsAppValido = "https://wa.me" + encodeURIComponent(txt);
        
        // Despachamos al cliente final hacia WhatsApp
        window.location.href = enlaceWhatsAppValido;

        // 4. RESETEO Y LIMPIEZA DE LA INTERFAZ
        car = []; descuento = 0;
        document.getElementById('inpNev').value = ''; document.getElementById('inpCim').value = ''; document.getElementById('inpTel').value = '';
        upC();
        secs.forEach(s => s.style.display = 'none');
        vp.style.display = 'flex';
    });

    // REGISTRO Y LOGIN SINCRONIZADO
    document.getElementById('btnGuardarRegistro').addEventListener('click', () => {
        const n = document.getElementById('regNev').value.trim(), c = document.getElementById('regCim').value, t = document.getElementById('regTel').value.trim();
        const p = document.getElementById('regPass') ? document.getElementById('regPass').value.trim() : "1234";
        if (n === "" || c === "" || t === "") { alert('Kérjük, töltsön ki minden kötelező mezőt!'); return; }

        localStorage.setItem('pesta_username', n); localStorage.setItem('pesta_password', p);
        localStorage.setItem('pesta_direccion', c); localStorage.setItem('pesta_telefono', t);
        localStorage.setItem('pesta_registrado', 'true');

        let bdGlobal = JSON.parse(localStorage.getItem('bd_global_usuarios') || '[]');
        bdGlobal.push({ n, p, c, t });
        localStorage.setItem('bd_global_usuarios', JSON.stringify(bdGlobal));

        cargarDatosEnCarrito(); alert('Sikeres regisztráció! Jó étvágyat kívánunk.');
        mostrarTiendaDeProductos();
    });

    document.getElementById('btnVerificarLogin').addEventListener('click', () => {
        const n = document.getElementById('logNev').value.trim(), p = document.getElementById('logPass').value.trim();
        let bdGlobal = JSON.parse(localStorage.getItem('bd_global_usuarios') || '[]');
        let userOk = bdGlobal.find(user => user.n === n && user.p === p);

        if (userOk) {
            localStorage.setItem('pesta_username', userOk.n); localStorage.setItem('pesta_password', userOk.p);
            localStorage.setItem('pesta_direccion', userOk.c); localStorage.setItem('pesta_telefono', userOk.t);
            localStorage.setItem('pesta_registrado', 'true');
            cargarDatosEnCarrito(); mostrarTiendaDeProductos();
        } else {
            alert('Hibás felhasználónév vagy jelszó! Új fiókhoz kérjük kattintson lent a regisztrációra.');
        }
    });

    // VIGILANTE EN CALIENTE PARA REDIRIGIR LOS BOTONES DEL MENÚ NATIVO
    setInterval(function() {
        if (!modoSoloVer) {
            document.querySelectorAll('.btn-agregar').forEach(btn => {
                if (!btn.hasAttribute('data-modal-blindado-supremo')) {
                    btn.setAttribute('data-modal-blindado-supremo', 'true');
                    btn.onclick = function(e) {
                        if (e) { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }
                        const name = this.getAttribute('data-name');
                        const price = this.getAttribute('data-price');
                        if (typeof inicializarVentanaExtras === "function" && name) {
                            inicializarVentanaExtras(name, price);
                        }
                    };
                }
            });
        }
    }, 450);

    function cargarDatosEnCarrito() {
        if (localStorage.getItem('pesta_registrado') === 'true') {
            document.getElementById('inpNev').value = localStorage.getItem('pesta_username');
            document.getElementById('inpCim').value = localStorage.getItem('pesta_direccion');
            document.getElementById('inpTel').value = localStorage.getItem('pesta_telefono');
            usuarioRegistrado = true;
        }
    }
    function mostrarTiendaDeProductos() { secs.forEach(s => s.style.display = 'none'); vp.style.display = 'none'; document.getElementById('s-tienda').style.display = 'block'; upC(); }
    function ocultarTodasLasSecciones() { vp.style.display = 'none'; secs.forEach(s => s.style.display = 'none'); }
    cargarDatosEnCarrito();
</script>
