/*EQUIPO*/
//Obtiene las clases del modal.
const botonesAbrirModal = document.querySelectorAll(".abrir-modal");
const botonesCerrarModal = document.querySelectorAll(".cerrar-modal");
const modales = document.querySelectorAll(".modal");


// Obtiene el boton y el index, es decir la posicion
botonesAbrirModal.forEach((boton, index) => {
    boton.addEventListener("click", () => {
        modales[index].showModal();
    });
});

botonesCerrarModal.forEach((boton, index) => {
    boton.addEventListener("click", () => {
        modales[index].close();
    });
});

/*RECORRIDO*/
function mostrarTabla(tablaAMostrar) {
    // Obtener todas las tablas detalle
    var tablasDetalle = document.getElementsByClassName('tabla-detalle');

    // Ocultar todas las tablas detalle
    for (var i = 0; i < tablasDetalle.length; i++) {
        tablasDetalle[i].style.display = 'none';
    }

    // Mostrar solo la tabla seleccionada
    var tablaSeleccionada = document.getElementById(tablaAMostrar);
    tablaSeleccionada.style.display = 'block';
}

/*TRIVIA*/
let preguntas_aleatorias = true;
let mostrar_pantalla_juego_terminado = true;
let reiniciar_puntos_al_reiniciar_el_juego = true;

let interprete_bp;
let pregunta;
let posibles_respuestas;
let btn_correspondiente = [
    select_id("btn1"),
    select_id("btn2"),
    select_id("btn3"),
    select_id("btn4")
];
let npreguntas = [];
let preguntas_hechas = 0;
let preguntas_correctas = 0;

window.onload = function () {
    //Realiza un solicitud fetch para recibir las preguntas
    fetch("base-preguntas.json")
        //Obtiene las respuesta a la solicitud y luego las convierte en un formato JSON.
        .then(response => response.json())
        .then(data => {
            interprete_bp = data;
            escogerPreguntaAleatoria();
        })
        //Se ejecutara si ocurre algun error durante el fetch.
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
};

function escogerPreguntaAleatoria() {
    if (!interprete_bp) {
        console.error('No se ha cargado la base de preguntas.');
        return;
    }

    //Randomiza el indice (n) entre 0 y 14 (totalidad de preguntas)
    let n;
    if (preguntas_aleatorias) {
        n = Math.floor(Math.random() * interprete_bp.length);
    } else {
        n = 0;
    }

    while (npreguntas.includes(n)) {
        n++;
        //Si es mayor o igual a la totalidad de preguntas, se reinicia (0).
        if (n >= interprete_bp.length) {
            n = 0;
        }
        //Si la cantidad de preguntas realizadas es igual a la cantidad de preguntas, muestra por pantalla la alerta de finalizacion.
        if (npreguntas.length === interprete_bp.length) {
            if (mostrar_pantalla_juego_terminado) {
                Swal.fire({
                    text: "Puntuación: " + preguntas_correctas + "/" + preguntas_hechas,
                    icon: "success"
                }).then(() => {
                    reiniciar();
                });
            }
            if (reiniciar_puntos_al_reiniciar_el_juego) {
                preguntas_correctas = 0;
                preguntas_hechas = 0;
            }
            npreguntas = [];
            return; // Detener la función hasta que se reinicie el juego
        }
    }
    //Si el juego todavia no termina, se suma preguntas_hechas y a la cantidad de preguntas se le da el indice de la pregunta actual.
    npreguntas.push(n);
    preguntas_hechas++;

    escogerPregunta(n);
}

//Asigna toda la informacion de la pregunta al HTML.
function escogerPregunta(n) {
    pregunta = interprete_bp[n];
    select_id("categoria").innerHTML = pregunta.categoria;
    select_id("pregunta").innerHTML = pregunta.pregunta;

    if (preguntas_hechas > 1) {
        select_id("puntaje").innerHTML = preguntas_correctas + "/" + (preguntas_hechas - 1);
    } else {
        select_id("puntaje").innerHTML = "";
    }

    style("imagen").objectFit = pregunta.object_fit;
    if (pregunta.imagen) {
        select_id("imagen").setAttribute("src", pregunta.imagen);
        style("imagen").height = "200px";
        style("imagen").width = "100%";
    } else {
        style("imagen").height = "0px";
        style("imagen").width = "0px";
        setTimeout(() => {
            select_id("imagen").setAttribute("src", "");
        }, 500);
    }

    desordenarRespuestas(pregunta);
}

//Desordena las respuestas.
function desordenarRespuestas(pregunta) {
    posibles_respuestas = [
        pregunta.respuesta,
        pregunta.incorrecta1,
        pregunta.incorrecta2,
        pregunta.incorrecta3,
    ];
    //devuelve numeros positivos y negativos, dandonle un orden aleatorio cada vez que se juega.
    posibles_respuestas.sort(() => Math.random() - 0.5);

    select_id("btn1").innerHTML = posibles_respuestas[0];
    select_id("btn2").innerHTML = posibles_respuestas[1];
    select_id("btn3").innerHTML = posibles_respuestas[2];
    select_id("btn4").innerHTML = posibles_respuestas[3];
}

//Se utiliza para que no se presionen varios botones al mismo tiempo
let suspender_botones = false;

function oprimir_btn(i) {
    if (suspender_botones) return;
    suspender_botones = true;
    //Detecta las respuestas y le asigna un color, verde a la correcta  y rosa a la incorrecta.
    if (posibles_respuestas[i] === pregunta.respuesta) {
        preguntas_correctas++;
        btn_correspondiente[i].style.background = "lightgreen";
    } else {
        btn_correspondiente[i].style.background = "pink";
    }
    //Recorre los botones para encontrar la respuesta correcta y marcarla de verde.
    for (let j = 0; j < 4; j++) {
        if (posibles_respuestas[j] === pregunta.respuesta) {
            btn_correspondiente[j].style.background = "lightgreen";
            break;
        }
    }
    //Asigna un tiempo antes de pasar a la siguiente pregunta.
    setTimeout(() => {
        reiniciar();
        suspender_botones = false;
    }, 1000);
}


function select_id(id) {
    return document.getElementById(id);
}

function style(id) {
    return select_id(id).style;
}
//Reinicia los styles de los botones y vuelve a elegir una pregunta.
function reiniciar() {
    for (const btn of btn_correspondiente) {
        btn.style.background = "white";
    }
    escogerPreguntaAleatoria();
}

/*GALERIA*/

//Definir las imágenes para ambas galerías
const galerias = {
    'VsArabia': [
        { "url": "media/Galeria/VsArabia/scaloni.jpg" },
        { "url": "media/Galeria/VsArabia/regate.jpg" },
        { "url": "media/Galeria/VsArabia/regate2.jpg" },
        { "url": "media/Galeria/VsArabia/papu.jpg" },
        { "url": "media/Galeria/VsArabia/messi.jpg" },
        { "url": "media/Galeria/VsArabia/licha.jpg" },
        { "url": "media/Galeria/VsArabia/lautaro.jpg" },
        { "url": "media/Galeria/VsArabia/festejo.jpg" },
        { "url": "media/Galeria/VsArabia/equipo.jpg" },
        { "url": "media/Galeria/VsArabia/equipo2.jpg" },
        { "url": "media/Galeria/VsArabia/entrajulian.jpg" },
        { "url": "media/Galeria/VsArabia/dibusegundogolarabia.jpg" },
        { "url": "media/Galeria/VsArabia/entraenzo.jpg" },
        { "url": "media/Galeria/VsArabia/dimaria.jpg" },
        { "url": "media/Galeria/VsArabia/cuti.jpg" }
    ],
    'VsMexico': [
        { "url": "media/Galeria/VsMexico/equipo.jpg" },
        { "url": "media/Galeria/VsMexico/choque.jpg" },
        { "url": "media/Galeria/VsMexico/depaul.jpg" },
        { "url": "media/Galeria/VsMexico/dibu.jpg" },
        { "url": "media/Galeria/VsMexico/enzo.jpg" },
        { "url": "media/Galeria/VsMexico/enzofestejo.jpg" },
        { "url": "media/Galeria/VsMexico/faltamontiel.jpg" },
        { "url": "media/Galeria/VsMexico/festejo.jpg" },
        { "url": "media/Galeria/VsMexico/festejo2.jpg" },
        { "url": "media/Galeria/VsMexico/gol2.jpg" },
        { "url": "media/Galeria/VsMexico/lautaro.jpg" },
        { "url": "media/Galeria/VsMexico/messi.jpg" },
        { "url": "media/Galeria/VsMexico/messigol.jpg" },
        { "url": "media/Galeria/VsMexico/regate.jpg" },
        { "url": "media/Galeria/VsMexico/scaloni.jpg" }
    ],
    'VsPolonia': [
        { "url": "media/Galeria/VsPolonia/macallisterjulian.jpg" },
        { "url": "media/Galeria/VsPolonia/acuña.jpg" },
        { "url": "media/Galeria/VsPolonia/defensa.jpg" },
        { "url": "media/Galeria/VsPolonia/depaul.jpg" },
        { "url": "media/Galeria/VsPolonia/dimaria.jpg" },
        { "url": "media/Galeria/VsPolonia/festejo.jpg" },
        { "url": "media/Galeria/VsPolonia/gol.jpg" },
        { "url": "media/Galeria/VsPolonia/goljulian.jpg" },
        { "url": "media/Galeria/VsPolonia/julian.jpg" },
        { "url": "media/Galeria/VsPolonia/macallistergol.jpg" },
        { "url": "media/Galeria/VsPolonia/penal.jpg" },
        { "url": "media/Galeria/VsPolonia/regate.jpg" },
        { "url": "media/Galeria/VsPolonia/salvada.jpg" },
        { "url": "media/Galeria/VsPolonia/salvada2.jpg" },
        { "url": "media/Galeria/VsPolonia/segundogoljulian.jpg" }
    ],
    'VsAustralia': [
        { "url": "media/Galeria/VsAustralia/equipo.jpg" },
        { "url": "media/Galeria/VsAustralia/dibu.jpg" },
        { "url": "media/Galeria/VsAustralia/enzo.jpg" },
        { "url": "media/Galeria/VsAustralia/festejo.jpg" },
        { "url": "media/Galeria/VsAustralia/acuña.jpg" },
        { "url": "media/Galeria/VsAustralia/gol.jpg" },
        { "url": "media/Galeria/VsAustralia/gol2.jpg" },
        { "url": "media/Galeria/VsAustralia/julian.jpg" },
        { "url": "media/Galeria/VsAustralia/licha.jpg" },
        { "url": "media/Galeria/VsAustralia/macallister.jpg" },
        { "url": "media/Galeria/VsAustralia/messi.jpg" },
        { "url": "media/Galeria/VsAustralia/molina.jpg" },
        { "url": "media/Galeria/VsAustralia/otamendi.jpg" },
        { "url": "media/Galeria/VsAustralia/papu.jpg" },
        { "url": "media/Galeria/VsAustralia/pasillo.jpg" }
    ],
    'VsPaisesbajos': [
        { "url": "media/Galeria/VsPaisesbajos/cuti.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/depaul.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/dibu.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/dibuatajada.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/equipo.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/festejo.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/festejo2.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/festejomolina.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/gol.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/licha.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/messifestejo.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/molina.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/pelea.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/regate.jpg" },
        { "url": "media/Galeria/VsPaisesbajos/scaloni.jpg" }
    ],
    'VsCroacia': [
        { "url": "media/Galeria/VsCroacia/cabala.jpg" },
        { "url": "media/Galeria/VsCroacia/enzo.jpg" },
        { "url": "media/Galeria/VsCroacia/equipo.jpg" },
        { "url": "media/Galeria/VsCroacia/cuti.jpg" },
        { "url": "media/Galeria/VsCroacia/festejo.jpg" },
        { "url": "media/Galeria/VsCroacia/festejo2.jpg" },
        { "url": "media/Galeria/VsCroacia/festejojulian.jpg" },
        { "url": "media/Galeria/VsCroacia/festejomessi.jpg" },
        { "url": "media/Galeria/VsCroacia/festejomessijulian.jpg" },
        { "url": "media/Galeria/VsCroacia/goljulian.jpg" },
        { "url": "media/Galeria/VsCroacia/golmessi.jpg" },
        { "url": "media/Galeria/VsCroacia/messi.jpg" },
        { "url": "media/Galeria/VsCroacia/messigvardiol.jpg" },
        { "url": "media/Galeria/VsCroacia/scaloni.jpg" },
        { "url": "media/Galeria/VsCroacia/tagliafico.jpg" }
    ],
    'VsFrancia': [
        { "url": "media/Galeria/VsFrancia/equipofinal.jpg" },
        { "url": "media/Galeria/VsFrancia/golmessi.jpg" },
        { "url": "media/Galeria/VsFrancia/festejomessi.jpg" },
        { "url": "media/Galeria/VsFrancia/goldimaria.jpg" },
        { "url": "media/Galeria/VsFrancia/dimaria.jpg" },
        { "url": "media/Galeria/VsFrancia/dibumolina.jpg" },
        { "url": "media/Galeria/VsFrancia/defensa.jpg" },
        { "url": "media/Galeria/VsFrancia/dibuatajada.jpg" },
        { "url": "media/Galeria/VsFrancia/messimbappe.jpg" },
        { "url": "media/Galeria/VsFrancia/paredesdibu.jpg" },
        { "url": "media/Galeria/VsFrancia/dybala.jpg" },
        { "url": "media/Galeria/VsFrancia/festejo.jpg" },
        { "url": "media/Galeria/VsFrancia/festejo2.jpg" },
        { "url": "media/Galeria/VsFrancia/festejocampeon.jpg" },
        { "url": "media/Galeria/VsFrancia/campeones.jpg" }
    ],
    'Campeones': [
        { "url": "media/Galeria/Campeones/1.jpg" },
        { "url": "media/Galeria/Campeones/2.jpg" },
        { "url": "media/Galeria/Campeones/3.jpg" },
        { "url": "media/Galeria/Campeones/4.jpg" },
        { "url": "media/Galeria/Campeones/5.jpg" },
        { "url": "media/Galeria/Campeones/6.jpg" },
        { "url": "media/Galeria/Campeones/7.jpg" },
        { "url": "media/Galeria/Campeones/8.jpg" },
        { "url": "media/Galeria/Campeones/9.jpg" },
        { "url": "media/Galeria/Campeones/10.jpg" },
        { "url": "media/Galeria/Campeones/11.jpg" },
        { "url": "media/Galeria/Campeones/12.jpg" },
    ]
};

// Inicializar las galerías
function inicializarGaleria(galeriaId, imagenes) {
    let actual = 0;
    const atras = document.querySelector(`#${galeriaId} .atras`);
    const adelante = document.querySelector(`#${galeriaId} .adelante`);
    const imagen = document.querySelector(`#${galeriaId} .img-container`);
    const puntos = document.querySelector(`#${galeriaId} .puntos`);

    function posicionCarrusel() {
        //Crea unos puntos para marcar la posicion de la galeria
        puntos.innerHTML = "";
        for (let i = 0; i < imagenes.length; i++) {
            if (i === actual) {
                puntos.innerHTML += `<p class="bold">.</p>`;
            } else {
                puntos.innerHTML += `<p>.</p>`;
            }
        }
    }

    function actualizarImagen() {
        imagen.innerHTML = `<img class="img" src="${imagenes[actual].url}">`;
        posicionCarrusel();
    }

    atras.addEventListener('click', () => {
        actual = (actual - 1 + imagenes.length) % imagenes.length;
        actualizarImagen();
    });

    adelante.addEventListener('click', () => {
        actual = (actual + 1) % imagenes.length;
        actualizarImagen();
    });

    // Inicializar la primera imagen y los puntos
    actualizarImagen();
}

// Ejecutar la inicialización para cada galería
document.addEventListener("DOMContentLoaded", () => {
    inicializarGaleria('VsArabia', galerias.VsArabia);
    inicializarGaleria('VsMexico', galerias.VsMexico);
    inicializarGaleria('VsPolonia', galerias.VsPolonia);
    inicializarGaleria('VsAustralia', galerias.VsAustralia);
    inicializarGaleria('VsPaisesbajos', galerias.VsPaisesbajos);
    inicializarGaleria('VsCroacia', galerias.VsCroacia);
    inicializarGaleria('VsFrancia', galerias.VsFrancia);
    inicializarGaleria('Campeones', galerias.Campeones);
});

/*ESTADIOS*/
const botonesAbrirModalEstadio = document.querySelectorAll(".abrir-modal-estadio");
const botonesCerrarModalEstadio = document.querySelectorAll(".cerrar-modal-estadio");
const modalesEstadio = document.querySelectorAll(".modal-estadio");

botonesAbrirModalEstadio.forEach((boton, index) => {
    boton.addEventListener("click", () => {
        modalesEstadio[index].showModal();
    });
});

botonesCerrarModalEstadio.forEach((boton, index) => {
    boton.addEventListener("click", () => {
        modalesEstadio[index].close();
    });
});

/*MODAL SUGERENCIA */
const botonesAbrirModalSugerencia = document.querySelectorAll(".abrir-modal-sugerencia");
const botonesCerrarModalSugerencia = document.querySelectorAll(".cerrar-modal-sugerencia");
const modalesSugerencia = document.querySelectorAll(".modal2");

botonesAbrirModalSugerencia.forEach((boton, index) => {
    boton.addEventListener("click", () => {
        modalesSugerencia[index].showModal();
    });
});

botonesCerrarModalSugerencia.forEach((boton, index) => {
    boton.addEventListener("click", () => {
        modalesSugerencia[index].close();
    });
});

/*VALIDACION FORMULARIO */
function validar() {
    // Obtener referencias a los elementos del formulario
var nombre = document.getElementById('nombre');
var telefono = document.getElementById('telefono');
var email = document.getElementById('email');
var sugerencia = document.getElementById('sugerencia');

// Establecer estilos por defecto
Estilos([nombre, telefono, email, sugerencia]);
    var errores = false; // Variable para controlar errores

    // Función que valida que la estructura del email sea correcta (contenga @ y . al final).
    function emailValido(email) {
        var mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return mail.test(email);
    }

    // Función que cambia los estilos si los campos son incorrectos.
    function setError(elemento) {
        elemento.style.borderColor = 'red';
        elemento.style.backgroundColor = '#ffcccc';
    }

    // Función que devuelve los estilos una vez que se encuentren correctos.
    function Estilos(elementos) {
        elementos.forEach(function(elemento) {
            elemento.style.borderColor = '';
            elemento.style.backgroundColor = '';
        });
    }

    // Verifica que los campos no estén vacíos
    if (nombre.value.trim() === '') {
        setError(nombre);
        errores = true;
    }

    // Verifica que el mail sea válido utilizando la función emailValido.
    if (!emailValido(email.value)) {
        setError(email);
        errores = true;
    }

    if (sugerencia.value.trim() === '') {
        setError(sugerencia);
        errores = true;
    }

    // Verifica que no haya ningún error, si se encuentra un error, el formulario no se envía.
    if (errores) {
        return false;
    }

    // Alerta que se utiliza para indicar que los datos son correctos.
    alert("¡Gracias por enviarnos tu sugerencia!");
    return true;
}

