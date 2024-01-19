// Variables

const sizeBtn = document.getElementById("sizeBtn");
const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let painting = false;
let isNewPath = false;
let lineWidthVar = 5;
let lineCapVar = 'round';
let strokeStyleVar = '#000';
let paths = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
    // Make the DIV element draggable:
    dragElement(document.getElementById("paint"));

    // Initialize size button
    sizeBtn.innerHTML = "□";

    let varWidth = canvas.clientWidth;
    let varHeight = canvas.clientHeight;

    // Set canvas size
    canvas.width = varWidth;
    canvas.height = varHeight;

    // Event listeners
    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mouseup', stopPainting);
    canvas.addEventListener('mousemove', draw);
}

function createNotification(title, message, buttons, input = false, type = 'text') {
    return new Promise((resolve) => {

        // Create notification container
        const notificationContainer = document.createElement('div');
        const inputElement = document.createElement('input');
        notificationContainer.classList.add('notification', 'win-border');

        // Create title element
        const titleElement = document.createElement('div');
        titleElement.classList.add('notification-title');
        titleElement.textContent = title;
        notificationContainer.appendChild(titleElement);

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.innerHTML = message;
        notificationContainer.appendChild(messageElement);

        // Create input field if needed
        if (input) {
            inputElement.type = type; // You can modify this based on your requirements
            // inputElement.value = 'Lienzo';
            inputElement.classList.add('notification-input');
            notificationContainer.appendChild(inputElement);
        }

        // Create buttons
        if (buttons && buttons.length > 0) {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('notification-buttons');

            buttons.forEach((button) => {
                const buttonElement = document.createElement('button');
                buttonElement.classList.add('notification-button', 'win-border');
                buttonElement.textContent = button.text;

                buttonElement.addEventListener('click', () => {
                    if (input) {
                        const inputValue = inputElement.value;
                        resolve({ buttonValue: button.value, inputValue });
                    } else {
                        resolve({ buttonValue: button.value });
                    }
                    document.body.removeChild(notificationContainer);
                });

                buttonContainer.appendChild(buttonElement);
            });

            notificationContainer.appendChild(buttonContainer);
        }

        // Append notification to the body
        document.body.appendChild(notificationContainer);

        // Show notification
        notificationContainer.style.display = 'block';
    });
}

function showMessage(title = '', texto = '') {
    createNotification(
        title,
        texto,
        [
            { text: 'Aceptar', value: true }
        ]
    );
}

function startPainting(e) {
    painting = true;
    draw(e, true);
}

function stopPainting() {
    painting = false;
    context.beginPath();
    savePath();
}

function draw(e, isNewPath) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineWidth = lineWidthVar;
    context.lineCap = lineCapVar;
    context.strokeStyle = strokeStyleVar;

    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);

    if (isNewPath) {
        savePath();
    }
}

function savePath() {
    // Guarda la ruta actual
    paths.push(context.getImageData(0, 0, canvas.width, canvas.height));
}

function restorePaths() {
    // Restaura todas las rutas almacenadas
    paths.forEach(path => {
        context.putImageData(path, 0, 0);
    });
}

function changeSize() {
    const window = document.getElementById("paint");
    const windowState = window.classList.contains("medium-size");
    if (windowState) {
        sizeBtn.innerHTML = "❏";
        window.classList.replace("medium-size", "full-size");
        window.style.top = "0";
        window.style.left = "0";
    } else {
        sizeBtn.innerHTML = "□";
        window.classList.replace("full-size", "medium-size");
    }

    // Guarda la imagen antes de cambiar de tamaño
    savePath();

    // Recalcula el tamaño del lienzo al cambiar el tamaño del contenedor
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Restaura la imagen después de cambiar de tamaño
    restorePaths();
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "-header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when the mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function resetCanvas() {
    context.reset();
}

function newCanvas() {
    createNotification(
        'Nuevo Lienzo',
        '¿Desea guardar el lienzo actual?',
        [
            { text: 'Si', value: 'si' },
            { text: 'No', value: 'no' },
            { text: 'Cancelar', value: 'cancelar' }
        ])
        .then((result) => {
            switch (result.buttonValue) {
                case 'si':
                    saveCanvas();
                    resetCanvas();
                case 'no':
                    resetCanvas();
                case 'cancelar':
                    return
                default:
                    return
            }

        });
}

function uploadCanvas() {
    // Pregunta al usuario la URL de la imagen
    createNotification(
        'Cargar Imagen',
        'Ingrese la URL de la imagen:',
        [
            { text: 'Cargar', value: true },
            { text: 'Cancelar', value: false }
        ],
        true, // Habilita el campo de entrada
        'file'
    )
        .then((result) => {
            if (result.buttonValue && result.inputValue) {
                const imageUrl = result.inputValue;
                // Crea una nueva imagen
                const img = new Image();
                img.src = imageUrl;
                console.log(img.width, img.height);

                // Cuando la imagen se carga, dibújala en el canvas
                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);
                };

                // Maneja el evento error de la imagen
                img.onerror = function () {
                    const alertTitle = '¡Hubo un error!';
                    const alertText = 'No se pudo cargar la imagen. Verifique la URL e inténtelo de nuevo.';
                    showMessage(alertTitle, alertText);
                };
            }
        });
}

function saveCanvas() {
    createNotification(
        'Guardar lienzo',
        'Ingrese el nombre del archivo:',
        [
            { text: 'Guardar', value: true },
            { text: 'Cancelar', value: false }
        ],
        true // Habilita el campo de entrada
    )
        .then((result) => {
            if (result.buttonValue && result.inputValue) {
                const fileName = result.inputValue;

                // Crea un enlace temporal
                const link = document.createElement('a');

                // Fondo blanco en el lienzo
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);

                // Restaura la imagen después de cambiar de tamaño
                restorePaths();

                // Asigna los datos del lienzo al enlace
                link.href = canvas.toDataURL();
                link.download = `${fileName}.png`;

                // Simula un clic en el enlace para iniciar la descarga
                link.click();
            }
        });
}

function infoPaint() {
    createNotification(
        'Acerca de PaintPSA',
        `¡Sea usted bienvenid@ a PaintSPA!<br><br>
        Actualmente este es un proyecto para tratar de recrear
        la experiencia de Paint de Windows95 en una página web.<br><br>
        Desarrollado por Hugo Colmenares.<br>`,
        [
            { text: 'Aceptar', value: true }
        ]
    );
}

function printPaint() {
    const titulo = 'Próximamente';
    const texto = '¡Aquí habrán dragones!';
    showMessage(titulo, texto);
}

function closePaint() {
    const window = document.getElementById("paint");
    window.style.display = 'none';
}