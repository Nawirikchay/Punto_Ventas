document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE TU NEGOCIO ---
    // Reemplaza los valores de ejemplo con tus datos reales.
    // Esta es la única sección que necesitas modificar.
    const businessConfig = {
        razonSocial: "VALENZUELA CALERO HENRY FABRICIO",
        nombreComercial: "ÑAWIRIKCHAY STUDIO",
        ruc: "1727643502001",
        claveAcceso: "80896795Duck",
        dirMatriz: "PICHINCHA / MEJIA / MACHACHI / LUIS CORDERO 132 Y JOSE MEJIA",
        dirEstablecimiento: "PICHINCHA / MEJIA / MACHACHI / LUIS CORDERO 132 Y JOSE MEJIA",
        telefonoContribuyente: "0998010491",
        urlLogo: "https://i.ibb.co/pvv0WvSm/awirikchay-studio-1.png",
        urlLogoPieCorreo: "https://i.ibb.co/pvv0WvSm/awirikchay-studio-1.png",
        
        // Datos para el envío de correo (ejemplo con Gmail)
        correoRemitente: "nawirikchaystudio@gmail.com",
        clavecorreoRemitente: "dtulsxcnbkfxjjrj", // IMPORTANTE: No es tu contraseña normal
        hostcorreoRemitente: "smtp.gmail.com",
        puertocorreoRemitente: "587",
        
        // Datos del certificado digital
        nombrep12: "luisPinta2.p12",
        
        // Configuración SRI
        ambientesri: "https://cel.sri.gob.ec", // URL de producción

        // --- INTERRUPTOR DEL WEBHOOK ---
        // Para desactivar la simulación de envío, cambia este valor a: false
        // Para volver a activarla, ponlo en: true
        activarWebhook: false
    };


    let cart = []; // El carrito de compras

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const cartItems = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const facturarBtn = document.getElementById('btn-facturar');
    const customerForm = document.getElementById('customer-form');
    
    // Referencias al nuevo formulario para agregar items
    const addItemForm = document.getElementById('add-item-form');
    const itemDescriptionInput = document.getElementById('item-description');
    const itemPriceInput = document.getElementById('item-price');
    
    // Elementos del Modal
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.getElementById('modal-close');

    // --- LÓGICA PARA AGREGAR ITEMS MANUALMENTE ---
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const description = itemDescriptionInput.value.trim();
        const price = parseFloat(itemPriceInput.value);
        const quantity = 1; // La cantidad es siempre 1 por defecto

        if (!description || isNaN(price) || price < 0) {
            showModal('Error de validación', 'Por favor, ingrese una descripción y un precio válidos.');
            return;
        }

        // Crear un nuevo objeto para el item
        const newItem = {
            id: Date.now(), // ID único basado en la fecha y hora
            code: 'CUSTOM', // Un código genérico para items manuales
            name: description,
            price: price,
            quantity: quantity
        };

        // Agregar el nuevo item al carrito
        cart.push(newItem);
        renderCart();

        // Limpiar el formulario y prepararlo para el siguiente item
        itemDescriptionInput.value = '';
        itemPriceInput.value = '';
        itemDescriptionInput.focus();
    });


    // --- FUNCIONES DE RENDERIZADO ---

    // Dibuja los items en el carrito
    function renderCart() {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty-message">El carrito está vacío</p>';
        } else {
            cartItems.innerHTML = '';
            cart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <div class="cart-item-info">
                        <p class="cart-item-name">${item.name}</p>
                        <p class="cart-item-details">${item.quantity} x $${item.price.toFixed(2)}</p>
                    </div>
                    <p class="cart-item-total">$${(item.quantity * item.price).toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <button data-id="${item.id}">🗑️</button>
                    </div>
                `;
                cartItemEl.querySelector('button').addEventListener('click', (e) => {
                    removeFromCart(parseInt(e.currentTarget.dataset.id));
                });
                cartItems.appendChild(cartItemEl);
            });
        }
        updateTotals();
    }

    // Actualiza los totales en pantalla
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        totalEl.textContent = `$${subtotal.toFixed(2)}`; // Asumimos IVA 0%
    }
    
    // --- LÓGICA DEL CARRITO ---
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        renderCart();
    }
    
    // --- LÓGICA DE FACTURACIÓN (SIMULADA) ---
    facturarBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showModal('Error', 'El carrito está vacío. Agregue items antes de facturar.');
            return;
        }

        const cliente = {
            cedula: document.getElementById('cliente-cedula').value.trim(),
            razonSocial: document.getElementById('cliente-razonSocial').value.trim(),
            correo: document.getElementById('cliente-correo').value.trim(),
            direccion: document.getElementById('cliente-direccion').value.trim(),
            telefono: document.getElementById('cliente-telefono').value.trim()
        };

        if (!cliente.cedula || !cliente.razonSocial || !cliente.correo) {
            showModal('Atención', 'Por favor, complete los campos de Cédula, Razón Social y Correo del cliente.');
            return;
        }
        
        const salesData = cart.map(item => ({
            productCode: item.code,
            productName: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        if (businessConfig.activarWebhook) {
            // --- Lógica con Webhook Activado ---
            const mockResult = {
                docNumber: "001-001-000123456",
                claveAcceso: "1310202501172784969500120010010001234560000000012",
                ambiente: "2",
                cliente: cliente
            };
            const webhookJson = prepareWebhookJson(salesData, mockResult);

            if (webhookJson) {
                console.log("--- SIMULACIÓN DE ENVÍO A WEBHOOK ---");
                console.log("Este es el JSON que se enviaría al servicio externo:");
                console.log(JSON.stringify(webhookJson, null, 2));
                showModal('¡Éxito!', 'Factura procesada y enviada a webhook (simulado). Revisa la consola (F12).');
            } else {
                showModal('Error', 'No se pudo generar el JSON para el webhook. La venta no se finalizó.');
                return; // Detener si hay un error en la preparación del JSON
            }
        } else {
            // --- Lógica con Webhook Desactivado ---
            console.log("--- WEBHOOK DESACTIVADO ---");
            console.log("La venta se ha procesado sin simular el envío.");
            showModal('Venta Finalizada', 'La venta se procesó localmente (webhook desactivado).');
        }

        // Limpiar la interfaz después de una venta exitosa (con o sin webhook)
        cart = [];
        customerForm.reset();
        renderCart();
    });

    // --- TU FUNCIÓN Y SUS AYUDANTES ---
    function formatIdentificacion(ident) { return ident; } 
    function getTipoIdentificacion(ident) {
        if (ident.length === 13) return "04"; // RUC
        if (ident.length === 10) return "05"; // Cédula
        return "07"; // Consumidor Final
    }
    function formatearTelefonoEcuador(tel) { return tel; }

    function prepareWebhookJson(salesData, result) {
        if (!result.docNumber || !result.claveAcceso) {
            console.log("Error: No hay datos de factura disponibles para el webhook.");
            return null;
        }

        var subtotal = 0;
        var codigosPrincipales = [];
        var codigosAuxiliares = [];
        var descripciones = [];
        var cantidades = [];
        var preciosUnitarios = [];
        var subtotalesSinIVA = [];
        var codigosPorcentaje = [];
        var tarifas = [];
        var ivas = [];
        var descuentos = [];

        for (var i = 0; i < salesData.length; i++) {
            var sale = salesData[i];
            var codigo = sale.productCode.trim();
            var descripcion = sale.productName.trim().replace(/,/g, ".");
            var precioUnitario = parseFloat(sale.price);
            var cantidad = parseFloat(sale.quantity);
            var subtotalProducto = precioUnitario * cantidad;

            subtotal += subtotalProducto;

            codigosPrincipales.push(codigo);
            codigosAuxiliares.push(codigo);
            descripciones.push(descripcion);
            cantidades.push(cantidad);
            preciosUnitarios.push(precioUnitario);
            subtotalesSinIVA.push(subtotalProducto);
            codigosPorcentaje.push("0");
            tarifas.push("0");
            ivas.push("0");
            descuentos.push("0");
        }

        var cantidadesFormateadas = cantidades.map(cantidad => cantidad.toFixed(2));
        var preciosUnitariosFormateados = preciosUnitarios.map(precio => precio.toFixed(2));
        var subtotalesSinIVAFormateados = subtotalesSinIVA.map(subtotal => subtotal.toFixed(2));
        var ivasFormateados = ivas.map(iva => parseFloat(iva).toFixed(2));
        var descuentosFormateados = descuentos.map(descuento => parseFloat(descuento).toFixed(2));

        var codigosPrincipalesStr = codigosPrincipales.join(' , ');
        var codigosAuxiliaresStr = codigosAuxiliares.join(' , ');
        var descripcionesStr = descripciones.join(' , ');
        var cantidadesStr = cantidadesFormateadas.join(' , ');
        var preciosUnitariosStr = preciosUnitariosFormateados.join('|');
        var subtotalesSinIVAStr = subtotalesSinIVAFormateados.join('|');
        var codigosPorcentajeStr = codigosPorcentaje.join(',');
        var tarifasStr = tarifas.join(',');
        var ivasStr = ivasFormateados.join('|');
        var descuentosStr = descuentosFormateados.join('|');

        var docParts = result.docNumber.split('-');
        var estab = docParts[0];
        var ptoEmi = docParts[1];
        var secuencial = docParts[2];
        var ambiente = result.ambiente || "2";

        var now = new Date();
        var fechaEmision = now.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });

        var identificacionComprador = formatIdentificacion(result.cliente.cedula);
        var tipoIdentificacionComprador = getTipoIdentificacion(identificacionComprador);
        var telefonoCliente = formatearTelefonoEcuador(result.cliente.telefono || "S/N");

        var instanceId = "67C8964C93564"; // Estos valores probablemente te los da tu proveedor de webhook
        var accessToken = "661b9b91e7fc7";

        // AHORA USA LOS DATOS DEL OBJETO DE CONFIGURACIÓN
        var jsonData = {
            "instance_id": instanceId,
            "access_token": accessToken,
            "archivo": `FACTURA-${estab}-${ptoEmi}-${secuencial}.xml`,
            "facturaPDF": `FACTURA-${estab}-${ptoEmi}-${secuencial}.pdf`,
            "correo": result.cliente.correo || "consumidor@final.com",
            "ambiente": ambiente,
            "razonSocial": businessConfig.razonSocial,
            "nombreComercial": businessConfig.nombreComercial,
            "ruc": businessConfig.ruc,
            "claveAcceso": result.claveAcceso,
            "estab": estab,
            "ptoEmi": ptoEmi,
            "secuencial": secuencial,
            "dirMatriz": businessConfig.dirMatriz,
            "contribuyenteRimpe": "",
            "contribuyenteRIDE": "CONTRIBUYENTE RÉGIMEN RIMPE NEGOCIO POPULAR",
            "fechaEmision": fechaEmision,
            "dirEstablecimiento": businessConfig.dirEstablecimiento,
            "obligadoContabilidad": "NO",
            "tipoIdentificacionComprador": tipoIdentificacionComprador,
            "razonSocialComprador": result.cliente.razonSocial,
            "identificacionComprador": identificacionComprador,
            "direccionComprador": result.cliente.direccion || "S/N",
            "telefonoCliente": telefonoCliente,
            "telefonoContribuyente": businessConfig.telefonoContribuyente,
            "factura": result.docNumber,
            "formaPago": "01",
            "formaPagoRIDE": "01 SIN UTILIZACIÓN DEL SISTEMA FINANCIERO",
            "codigoPorcentajeTotales": "0",
            "baseImponibleTotales": subtotal.toFixed(2),
            "valorTotales": "0.00",
            "totalSinImpuestos": subtotal.toFixed(2),
            "importeTotal": subtotal.toFixed(2),
            "totalDescuento": "0.00",
            "valor": "0.00",
            "codigoPrincipal": codigosPrincipalesStr,
            "codigoAuxiliar": codigosAuxiliaresStr,
            "descripcion": descripcionesStr,
            "cantidad": cantidadesStr,
            "precioUnitario": preciosUnitariosStr,
            "subtotalSinIVA": subtotalesSinIVAStr,
            "codigoPorcentaje": codigosPorcentajeStr,
            "tarifa": tarifasStr,
            "iva": ivasStr,
            "descuento": descuentosStr,
            "subtotal12": "0.00",
            "subtotal0": subtotal.toFixed(2),
            "subtotalNoObjeto": "0.00",
            "subtotalExento": "0.00",
            "campoAdicional": "campoAdicional nombre=\"Correo de cliente\"",
            "codigoArtesano": result.cliente.correo || "consumidor@final.com",
            "artesanoRide": "-",
            "clave_12": businessConfig.claveAcceso,
            "urlLogo": businessConfig.urlLogo,
            "urlLogoPieCorreo": businessConfig.urlLogoPieCorreo,
            "correoRemitente": businessConfig.correoRemitente,
            "clavecorreoRemitente": businessConfig.clavecorreoRemitente,
            "hostcorreoRemitente": businessConfig.hostcorreoRemitente,
            "puertocorreoRemitente": businessConfig.puertocorreoRemitente,
            "nombrep12": businessConfig.nombrep12,
            "ambientesri": businessConfig.ambientesri
        };
        
        return jsonData;
    }
    
    // --- Lógica del Modal ---
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('visible');
    }

    modalClose.addEventListener('click', () => {
        modal.classList.remove('visible');
    });

    // --- INICIALIZACIÓN ---
    renderCart(); // Para mostrar el mensaje de "carrito vacío" al inicio
});

