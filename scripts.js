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
        { "url": "https://i.ibb.co/Zgrbs4n/scaloni.jpg" },
        { "url": "https://i.ibb.co/P1kQqRq/regate.jpg" },
        { "url": "https://i.ibb.co/RyZJV7L/regate2.jpg" },
        { "url": "https://i.ibb.co/CMkN5j8/papu.jpg" },
        { "url": "https://i.ibb.co/dWC3WSS/messi.jpg" },
        { "url": "https://i.ibb.co/8zMy9Y2/licha.jpg" },
        { "url": "https://i.ibb.co/CMGVXkP/lautaro.jpg" },
        { "url": "https://i.ibb.co/C2LH2JY/festejo.jpg" },
        { "url": "https://i.ibb.co/ftZFvQR/equipo.jpg" },
        { "url": "https://i.ibb.co/YPSjm5C/equipo2.jpg" },
        { "url": "https://i.ibb.co/XVtKS1K/entrajulian.jpg" },
        { "url": "https://i.ibb.co/yBhcx7H/dibusegundogolarabia.jpg" },
        { "url": "https://i.ibb.co/MC5gk5R/entraenzo.jpg" },
        { "url": "https://i.ibb.co/sJDq75y/dimaria.jpg" },
        { "url": "https://i.ibb.co/d4xG0q3/cuti.jpg" }
    ],
    'VsMexico': [
        { "url": "https://i.ibb.co/Dp0Wsm9/equipo.jpg" },
        { "url": "https://i.ibb.co/92k36gt/choque.jpg" },
        { "url": "https://i.ibb.co/d6fYxty/depaul.jpg" },
        { "url": "https://i.ibb.co/dr9HFtW/dibu.jpg" },
        { "url": "https://i.ibb.co/mXpv5Xb/enzo.jpg" },
        { "url": "https://i.ibb.co/71FN0m0/enzofestejo.jpg" },
        { "url": "https://i.ibb.co/Cw3GG5J/faltamontiel.jpg" },
        { "url": "https://i.ibb.co/WkbZBh0/festejo.jpg" },
        { "url": "https://i.ibb.co/HqYVdj6/festejo2.jpg" },
        { "url": "https://i.ibb.co/x2CCdNF/gol2.jpg" },
        { "url": "https://i.ibb.co/h29cJ37/lautaro.jpg" },
        { "url": "https://i.ibb.co/1mqnPk9/messi.jpg" },
        { "url": "https://i.ibb.co/VS3B3DB/messigol.jpg" },
        { "url": "https://i.ibb.co/34KxY2C/regate.jpg" },
        { "url": "https://i.ibb.co/tC8S8z4/scaloni.jpg" }
    ],
    'VsPolonia': [
        { "url": "https://i.ibb.co/HPTWL6x/macallisterjulian.jpg" },
        { "url": "https://i.ibb.co/RhfHPVW/acu-a.jpg" },
        { "url": "https://i.ibb.co/HCNymM4/defensa.jpg" },
        { "url": "https://i.ibb.co/3WWcCzB/depaul.jpg" },
        { "url": "https://i.ibb.co/GvQfHwm/dimaria.jpg" },
        { "url": "https://i.ibb.co/f8C1dF5/festejo.jpg" },
        { "url": "https://i.ibb.co/QjjQPkX/gol.jpg" },
        { "url": "https://i.ibb.co/7VL9PNL/goljulian.jpg" },
        { "url": "https://i.ibb.co/PFYjJrD/julian.jpg" },
        { "url": "https://i.ibb.co/djCSvFN/macallistergol.jpg" },
        { "url": "https://i.ibb.co/M2tCxvF/penal.jpg" },
        { "url": "https://i.ibb.co/Bq25gwt/regate.jpg" },
        { "url": "https://i.ibb.co/vXmP8sh/salvada.jpg" },
        { "url": "https://i.ibb.co/fHkSrCr/salvada2.jpg" },
        { "url": "https://i.ibb.co/2Yz6tGR/segundogoljulian.jpg" }
    ],
    'VsAustralia': [
        { "url": "https://i.ibb.co/PhR86zP/equipo.jpg" },
        { "url": "https://i.ibb.co/dczGrL5/dibu.jpg" },
        { "url": "https://i.ibb.co/fqSdVwZ/enzo.jpg" },
        { "url": "https://i.ibb.co/jwHm1DV/festejo.jpg" },
        { "url": "https://i.ibb.co/hZnnyr9/acu-a.jpg" },
        { "url": "https://i.ibb.co/jgcsmbX/gol.jpg" },
        { "url": "https://i.ibb.co/LpgY71F/gol2.jpg" },
        { "url": "https://i.ibb.co/JxdD6Nr/julian.jpg" },
        { "url": "https://i.ibb.co/K71KNzX/licha.jpg" },
        { "url": "https://i.ibb.co/9rdvs2r/macallister.jpg" },
        { "url": "https://i.ibb.co/C8rPv8k/messi.jpg" },
        { "url": "https://i.ibb.co/GsyQZHW/molina.jpg" },
        { "url": "https://i.ibb.co/pynVYxc/otamendi.jpg" },
        { "url": "https://i.ibb.co/tcCrgTN/papu.jpg" },
        { "url": "https://i.ibb.co/CQxnQy2/pasillo.jpg" }
    ],
    'VsPaisesbajos': [
        { "url": "https://i.ibb.co/qFZDDTG/cuti.jpg" },
        { "url": "https://i.ibb.co/fFSsk89/depaul.jpg" },
        { "url": "https://i.ibb.co/nwXZjrp/dibu.jpg" },
        { "url": "https://i.ibb.co/gwPdSVD/dibuatajada.jpg" },
        { "url": "https://i.ibb.co/6PW6f0J/equipo.jpg" },
        { "url": "https://i.ibb.co/HzyxK3W/festejo.jpg" },
        { "url": "https://i.ibb.co/FXNMGFT/festejo2.jpg" },
        { "url": "https://i.ibb.co/P47j5nD/festejomolina.jpg" },
        { "url": "https://i.ibb.co/3yWjpfc/gol.jpg" },
        { "url": "https://i.ibb.co/qNfYsmD/licha.jpg" },
        { "url": "https://i.ibb.co/VVCjpwT/messifestejo.jpg" },
        { "url": "https://i.ibb.co/WnhLT8C/molina.jpg" },
        { "url": "https://i.ibb.co/D59Tm7z/pelea.jpg" },
        { "url": "https://i.ibb.co/sKbRc7c/regate.jpg" },
        { "url": "https://i.ibb.co/6Z9vb52/scaloni.jpg" }
    ],
    'VsCroacia': [
        { "url": "https://i.ibb.co/ygdg4DW/cabala.jpg" },
        { "url": "https://i.ibb.co/SXk0F13/enzo.jpg" },
        { "url": "https://i.ibb.co/rFjR18W/equipo.jpg" },
        { "url": "https://i.ibb.co/zrTgn42/cuti.jpg" },
        { "url": "https://i.ibb.co/MNdBBsv/festejo.jpg" },
        { "url": "https://i.ibb.co/Dzsx46J/festejo2.jpg" },
        { "url": "https://i.ibb.co/YyFC1pH/festejojulian.jpg" },
        { "url": "https://i.ibb.co/CwrxvSJ/festejomessi.jpg" },
        { "url": "https://i.ibb.co/mcqXbJx/festejomessijulian.jpg" },
        { "url": "https://i.ibb.co/MVbjNDz/goljulian.jpg" },
        { "url": "https://i.ibb.co/CPQVN3N/golmessi.jpg" },
        { "url": "https://i.ibb.co/wzwm3v0/messi.jpg" },
        { "url": "https://i.ibb.co/hV4KMgj/messigvardiol.jpg" },
        { "url": "https://i.ibb.co/FzfK88r/scaloni.jpg" },
        { "url": "https://i.ibb.co/HrwyVC4/tagliafico.jpg" }
    ],
    'VsFrancia': [
        { "url": "https://i.ibb.co/WKQ1641/equipofinal.jpg" },
        { "url": "https://i.ibb.co/rMzNNsd/golmessi.jpg" },
        { "url": "https://i.ibb.co/cxH5Wz1/festejomessi.jpg" },
        { "url": "https://i.ibb.co/hDDgqVn/goldimaria.jpg" },
        { "url": "https://i.ibb.co/GV3XJRd/dimaria.jpg" },
        { "url": "https://i.ibb.co/rmYWffk/dibumolina.jpg" },
        { "url": "https://i.ibb.co/GJR1WNW/defensa.jpg" },
        { "url": "https://i.ibb.co/zFqwMmF/dibuatajada.jpg" },
        { "url": "https://i.ibb.co/TkXqdK7/messimbappe.jpg" },
        { "url": "https://i.ibb.co/NjMCCyM/paredesdibu.jpg" },
        { "url": "https://i.ibb.co/6n1F7HY/dybala.jpg" },
        { "url": "https://i.ibb.co/yXVtDp9/festejo.jpg" },
        { "url": "https://i.ibb.co/W3rq21G/festejo2.jpg" },
        { "url": "https://i.ibb.co/YjpR1DX/festejocampeon.jpg" },
        { "url": "https://i.ibb.co/YD6rS6M/campeones.jpg" }
    ],
    'Campeones': [
        { "url": "https://i.ibb.co/cLkT7q3/1.jpg" },
        { "url": "https://i.ibb.co/nj4mBVG/2.jpg" },
        { "url": "https://i.ibb.co/CBNr4KY/3.jpg" },
        { "url": "https://i.ibb.co/xqkhLdh/4.jpg" },
        { "url": "https://i.ibb.co/wzvYGQH/5.jpg" },
        { "url": "https://i.ibb.co/jfZpvG8/6.jpg" },
        { "url": "https://i.ibb.co/TMQ5L68/7.jpg" },
        { "url": "https://i.ibb.co/0VDJnfT/8.jpg" },
        { "url": "https://i.ibb.co/CVdW3bV/9.jpg" },
        { "url": "https://i.ibb.co/SdNdJSc/10.jpg" },
        { "url": "https://i.ibb.co/G2zr5HZ/11.jpg" },
        { "url": "https://i.ibb.co/0YbvGgr/12.jpg" },
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

