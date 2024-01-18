// Variables

const sizeBtn = document.getElementById("sizeBtn");
const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let painting = false;
let isNewPath = false;
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

    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = '#000';

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

function newCanvas() {
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire("Saved!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
        }
      });
}