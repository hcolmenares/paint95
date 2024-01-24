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
let canvasHistory = [];
let forwardHistory = [];
let forwardPaths = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
    checkMobile()
    
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
    document.addEventListener('keydown', function (event) {
        // Verifica si la tecla presionada es 'z' y si la tecla 'Control' o 'Command' está presionada
        if ((event.key === 'z' || event.key === 'Z') && (event.ctrlKey || event.metaKey)) {
            cmdBack();
        }
    });
    document.addEventListener('keydown', function (event) {
        // Verifica si la tecla presionada es 'y' y si la tecla 'Control' o 'Command' está presionada
        if ((event.key === 'y' || event.key === 'Y') && (event.ctrlKey || event.metaKey)) {
            cmdForward();
        }
    });
}

function checkMobile() {
    // Verificar si el usuario está en un dispositivo móvil
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        // Si es un dispositivo móvil, mostrar un mensaje
        const titulo = 'Advertencia';
        const texto = 'Algunas funcionalidades podrían verse limitadas en dispositivos móviles. Se recomienda ver el Changelog';
        showMessage(titulo, texto);
    }
}

function createNotification(title, message, buttons, input = false, type = 'text', value = null) {
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
            type == 'text' ? inputElement.value = 'Lienzo' : null;
            if (type == 'number') {
                inputElement.value = 5;
                inputElement.setAttribute('min', 1);
                inputElement.setAttribute('max', 30);
            }
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
        forwardPaths = [];
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

function cmdBack() {
    // Verifica si hay rutas almacenadas
    if (paths.length > 0) {
        // Elimina la última ruta
        forwardPaths.push(context.getImageData(0, 0, canvas.width, canvas.height));
        paths.pop();

        // Limpia el lienzo
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Restaura las rutas restantes
        restorePaths();
    }
    else {
        return
    }
}

function cmdForward() {
    // Verifica si hay rutas en el historial adelante
    if (forwardPaths.length > 0) {
        // Obtiene la última ruta adelante
        const forwardPath = forwardPaths.pop();

        // Guarda la ruta actual en el historial atrás
        paths.push(context.getImageData(0, 0, canvas.width, canvas.height));

        // Dibuja la ruta adelante en el lienzo
        context.putImageData(forwardPath, 0, 0);
    }
    else {
        return
    }
}

function penMode() {
    strokeStyleVar = '#000';
    context.globalCompositeOperation = "source-over";
}

function eraserMode() {
    strokeStyleVar = '#fff';
    context.globalCompositeOperation = "destination-out";
}

function changePenSize() {
    createNotification(
        'Cambiar tamaño del lapiz',
        'Ingrese el nuevo tamaño en pixeles del lapiz:',
        [
            { text: 'Aceptar', value: true },
            { text: 'Cancelar', value: false }
        ],
        true, // Habilita el campo de entrada
        'number'
    )
        .then((result) => {
            if (result.buttonValue && result.inputValue) {
                const newSize = result.inputValue;
                if (newSize < 1) {
                    const alertTitle = '¡Hubo un error!';
                    const alertText = 'No se asignar un valor menor a 1';
                    showMessage(alertTitle, alertText);
                }
                lineWidthVar = newSize;
            }
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
    var isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (document.getElementById(elmnt.id + "-header")) {
        // If present, the header is where you move the DIV from:
        if (isMobile) {
            // For mobile devices, use touch events
            document.getElementById(elmnt.id + "-header").ontouchstart = dragTouchStart;
        } else {
            // For non-mobile devices, use mouse events
            document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
        }
    } else {
        // Otherwise, move the DIV from anywhere inside the DIV:
        if (isMobile) {
            // For mobile devices, use touch events
            elmnt.ontouchstart = dragTouchStart;
        } else {
            // For non-mobile devices, use mouse events
            elmnt.onmousedown = dragMouseDown;
        }
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function dragTouchStart(e) {
        e = e || window.event;
        e.preventDefault();
        // Get the touch position at startup:
        var touch = e.touches[0];
        pos3 = touch.clientX;
        pos4 = touch.clientY;
        document.ontouchend = closeDragElement;
        // Call a function whenever the touch position changes:
        document.ontouchmove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculate the new cursor position:
        pos1 = pos3 - (isMobile ? e.touches[0].clientX : e.clientX);
        pos2 = pos4 - (isMobile ? e.touches[0].clientY : e.clientY);
        pos3 = isMobile ? e.touches[0].clientX : e.clientX;
        pos4 = isMobile ? e.touches[0].clientY : e.clientY;
        // Set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // Stop moving when the mouse button or touch is released:
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchmove = null;
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