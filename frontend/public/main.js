/* ============================================================
   main.js - Lógica principal del front
   Comentado para entender qué hace cada función y por qué.
   ============================================================ */

/* URL base del backend: cuando lo subas a internet, cambiás esto */
const API_BASE = 'http://127.0.0.1:3000';


/* Extraemos del path el nombre del archivo HTML actual.
   Ej: si estás en /public/explorar.html → devuelve "explorar.html". */
const path = window.location.pathname.split('/').pop();

/* --------------------------------------------------------------
   onDOM(selector, cb)
   - selector: string tipo "#id" o ".clase"
   - cb: callback (función) que recibe el elemento encontrado
   Sirve para evitar "undefined" si la página no tiene ese elemento.
   -------------------------------------------------------------- */
function onDOM(selector, cb) {
    const el = document.querySelector(selector);
    if (el) cb(el);     // si existe, ejecuta la función
}

/* --------------------------------------------------------------
   jsonResponse(res)
   - res: respuesta del fetch
   Si el status no es OK (200-299), tira error.
   Si es OK, convierte la respuesta JSON → objeto JS.
   -------------------------------------------------------------- */
function jsonResponse(res) {
    if (!res.ok) throw new Error(res.statusText || 'Error en la respuesta');
    return res.json();
}

/* ============================================================
   1) REGISTRO
   POST /register
   ============================================================ */
function handleRegister() {

    onDOM('#registerForm', form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // evita recargar la página

            // Armamos un objeto con los datos del formulario
            const data = {
                username: form.querySelector('#username').value.trim(),
                password: form.querySelector('#password').value,
                nombre: form.querySelector('#nombre').value.trim(),
                edad: Number(form.querySelector('#edad').value),
                carrera: form.querySelector('#carrera').value.trim(),
                descripcion: form.querySelector('#descripcion').value.trim(),
                instagram: form.querySelector('#instagram').value.trim()
            };

            // Validación básica del lado del cliente
            if (!data.username || !data.password) return alert('Usuario y contraseña obligatorios.');
            if (isNaN(data.edad) || data.edad < 18 || data.edad > 100) return alert('Edad inválida (18-100).');

            try {
                const res = await fetch(`${API_BASE}/api/register`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const responseData = await jsonResponse(res); // guardamos la respuesta con info del usuario

                // Guardamos el id del usuario en localStorage
                localStorage.setItem('userId', responseData.data.id);

                alert('Registro exitoso. ¡Ahora podés explorar!');
                window.location.href = 'explorar.html'; // redirige directamente al explorer

            } catch (err) {
                console.error(err);
                alert('Error al registrar: ' + err.message);
            }
        });
    });
}


/* ============================================================
   2) LOGIN
   POST /login
   ============================================================ */
function handleLogin() {

    onDOM('#loginForm', form => {

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Tomamos usuario y contraseña
            const payload = {
                username: form.querySelector('#username').value.trim(),
                password: form.querySelector('#password').value
            };

            try {
                const res = await fetch(`${API_BASE}/api/login`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await jsonResponse(res); // guardamos la respuesta con info del usuario

                // Guardamos el id del usuario logueado en localStorage
                localStorage.setItem('userId', data.data.id);

                // Login OK → pasamos a explorar
                window.location.href = 'explorar.html';

            } catch (err) {
                console.error(err);
                alert('Login falló: ' + err.message);
            }

        }
        );

    });

}

/* ============================================================
   3) EXPLORAR PERFILES
   GET /users
   POST /like/:id
   ============================================================ */

// Acá guardamos los perfiles que nos manda el backend
let perfiles = [];
let currentIndex = 0;


/* --------------------------------------------------------------
   cargarPerfiles()
   - Hace GET /users
   - Guarda la lista en "perfiles"
   - Muestra el primer perfil
   -------------------------------------------------------------- */
async function cargarPerfiles() {
    const userId = localStorage.getItem('userId'); // id guardado en register o login

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }
    // Traemos el id del usuario logueado desde el localStorage.
    // Esto se usa para que el backend sepa quién está viendo los perfiles y
    // así no mostrarle su propio perfil en el explorer.
    // Necesario entrar como un usuario para ir al explorer.

    try {
        const res = await fetch(`${API_BASE}/api/users?userId=${userId}`, {
        credentials: 'include'
        });

        perfiles = await res.json(); // array directo del backend
        if(currentIndex==null)currentIndex = 0;
        renderPerfil();
    } catch (err) {
        console.error(err);
        document.getElementById('perfilNombre').textContent = 'Error al cargar perfiles man.';
    }
}




/* --------------------------------------------------------------
   renderPerfil()
   - Muestra en pantalla el perfil actual (por currentIndex)
   - Si no hay más perfiles, muestra mensaje "No hay más"
   -------------------------------------------------------------- */
function renderPerfil() {
    const perfilCard = document.getElementById('perfilCard');
    const noMore = document.getElementById('noMore');

    // Si no hay perfiles o ya pasamos todos
    if (!perfiles.length || currentIndex >= perfiles.length) {
        perfilCard.style.display = 'none';
        noMore.style.display = 'block';
        return;
    }

    // Tomamos el perfil actual
    const p = perfiles[currentIndex];

    perfilCard.style.display = 'block';
    noMore.style.display = 'none';

    document.getElementById('perfilNombre').textContent = p.nombre || p.username;
    document.getElementById('perfilMeta').textContent = `${p.edad} • ${p.carrera}`;
    document.getElementById('perfilDescripcion').textContent = p.descripcion || '';
}

/* --------------------------------------------------------------
   setupSkip()
   - Al hacer click en "Skip", pasamos al siguiente perfil
   -------------------------------------------------------------- */
function setupSkip() {
    onDOM('#skipBtn', btn => {
        btn.addEventListener('click', () => {
            currentIndex++; // pasamos al próximo
            renderPerfil();
        });
    });
}

/* --------------------------------------------------------------
   setupLike()
   - Al hacer click en "Like":
       → Enviamos POST /like/:id
       → Backend devuelve si hubo match o no
       → Avanzamos al siguiente perfil
   -------------------------------------------------------------- */
function setupLike() {
    onDOM('#likeBtn', btn => {
        btn.addEventListener('click', async () => {
            const perfil = perfiles[currentIndex];
            if (!perfil) return;

            const userId = localStorage.getItem('userId'); // usamos el id guardado

            try {
                const res = await fetch(`${API_BASE}/api/like/${perfil.id}?userId=${userId}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                const data = await jsonResponse(res);

                if (data.match) {
                    alert(`¡Match con ${data.partner.nombre || data.partner.username}! IG: ${data.partner.instagram}`);
                }

                currentIndex++;
                renderPerfil();

            } catch (err) {
                console.error(err);
                alert('Error al dar like.');
            }
        });

    });
}

/* ============================================================
   4) LISTAR MATCHES
   GET /matches
   ============================================================ */

/* --------------------------------------------------------------
   cargarMatches()
   - Hace GET /matches
   - Muestra la lista en match.html
   -------------------------------------------------------------- */
async function cargarMatches() {
    try {
        const res = await fetch(`${API_BASE}/api/matches`, {
            credentials: 'include'
        });

        const lista = await jsonResponse(res);

        const ul = document.getElementById('matchesList');
        const noMatches = document.getElementById('noMatches');

        // Si no hay matches
        if (!lista.length) {
            noMatches.style.display = 'block';
            ul.innerHTML = '';
            return;
        }

        noMatches.style.display = 'none';
        ul.innerHTML = '';

        // Recorremos cada match y lo agregamos al HTML
        lista.forEach(m => {
            const li = document.createElement('li');

            li.innerHTML = `
        <span>${m.nombre || m.username}
          <small class="muted">(${m.edad} • ${m.carrera})</small>
        </span>
        <span><strong>${m.instagram}</strong></span>
      `;

            ul.appendChild(li);
        });

    } catch (err) {
        console.error(err);

        // Si no hay sesión
        if (err.message.toLowerCase().includes('unauthorized')) {
            window.location.href = 'login.html';
        }
    }
}

/* ============================================================
   5) Inicialización por página
   Según la página donde estés, se ejecutan funciones distintas.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (path === 'register.html') handleRegister();
    if (path === 'login.html') handleLogin();
    if (path === 'explorar.html') {
        cargarPerfiles();
        setupSkip();
        setupLike();
    }
    if (path === 'match.html') cargarMatches();
});
