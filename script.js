const formulario = document.getElementById('form-tarea');
const inputTarea = document.getElementById('input-tarea');
const inputFecha = document.getElementById('input-fecha');
const inputCategoria = document.getElementById('input-categoria');
const listaTareas = document.getElementById('lista-tareas');
const contadorPendientes = document.getElementById('contador-pendientes');
const botonesFiltro = document.querySelectorAll('.filtro');
const modoBtn = document.getElementById('modo-btn');

let tareas = [];
let filtroActual = 'todas';

// ================== Cargar tareas ==================
function cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    if (tareasGuardadas) tareas = JSON.parse(tareasGuardadas);
    renderizarTareas();
}

// ================== Guardar tareas ==================
function guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}

// ================== Agregar tarea ==================
function agregarTarea(texto) {
    const nuevaTarea = {
        id: Date.now(),
        texto,
        completada: false,
        fecha: inputFecha.value,
        categoria: inputCategoria.value
    };

    tareas.unshift(nuevaTarea);
    guardarTareas();
    renderizarTareas();
}

// ================== Editar tarea ==================
function editarTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    const nuevoTexto = prompt("Editar tarea:", tarea.texto);

    if (nuevoTexto) {
        tarea.texto = nuevoTexto.trim();
        guardarTareas();
        renderizarTareas();
    }
}

// ================== Toggle completada ==================
function toggleTarea(id) {
    tareas = tareas.map(t => {
        if (t.id === id) return { ...t, completada: !t.completada };
        return t;
    });

    guardarTareas();
    renderizarTareas();
}

// ================== Eliminar tarea con animación ==================
function eliminarTarea(id) {
    const li = document.querySelector(`[data-id="${id}"]`);
    li.classList.add('eliminando');

    setTimeout(() => {
        tareas = tareas.filter(t => t.id !== id);
        guardarTareas();
        renderizarTareas();
    }, 300);
}

// ================== Filtrar tareas ==================
function filtrarTareas() {
    if (filtroActual === 'pendientes') return tareas.filter(t => !t.completada);
    if (filtroActual === 'completadas') return tareas.filter(t => t.completada);
    return tareas;
}

// ================== Detectar tareas por vencer ==================
function estaPorVencer(fecha) {
    if (!fecha) return false;
    const hoy = new Date();
    const limite = new Date(fecha);
    const diff = limite - hoy;
    return diff < 1000 * 60 * 60 * 48 && diff > 0;
}

// ================== Renderizar tareas ==================
function renderizarTareas() {
    const tareasFiltradas = filtrarTareas();
    listaTareas.innerHTML = '';

    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = `<li class="sin-tareas">No hay tareas</li>`;
        actualizarContador();
        return;
    }

    tareasFiltradas.forEach(tarea => {
        const li = document.createElement('li');
        li.className = `tarea ${tarea.completada ? 'completada' : ''} ${estaPorVencer(tarea.fecha) ? 'por-vencer' : ''}`;
        li.dataset.id = tarea.id;

        li.innerHTML = `
            <input type="checkbox" ${tarea.completada ? 'checked' : ''}>
            <span class="tarea-texto">${escaparHTML(tarea.texto)}</span>

            <small class="categoria">${tarea.categoria}</small>
            <small class="fecha">${tarea.fecha || ''}</small>

            <button class="btn-editar">✏️</button>
            <button class="btn-eliminar">🗑️</button>
        `;

        li.querySelector('input').addEventListener('change', () => toggleTarea(tarea.id));
        li.querySelector('.btn-editar').addEventListener('click', () => editarTarea(tarea.id));
        li.querySelector('.btn-eliminar').addEventListener('click', () => eliminarTarea(tarea.id));

        listaTareas.appendChild(li);
    });

    actualizarContador();
}

// ================== Contador ==================
function actualizarContador() {
    const pendientes = tareas.filter(t => !t.completada).length;
    contadorPendientes.textContent = pendientes;
}

// ================== Seguridad ==================
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// ================== Eventos ==================
formulario.addEventListener('submit', e => {
    e.preventDefault();
    const texto = inputTarea.value.trim();
    if (!texto) return;

    agregarTarea(texto);
    inputTarea.value = '';
    inputFecha.value = '';
});

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', () => {
        botonesFiltro.forEach(b => b.classList.remove('activo'));
        boton.classList.add('activo');
        filtroActual = boton.dataset.filtro;
        renderizarTareas();
    });
});

// ================== Modo oscuro ==================
modoBtn.addEventListener('click', () => {
    document.body.classList.toggle('oscuro');
    modoBtn.textContent = document.body.classList.contains('oscuro')
        ? "☀️ Modo Claro"
        : "🌙 Modo Oscuro";
});

// ================== Iniciar ==================
cargarTareas();
