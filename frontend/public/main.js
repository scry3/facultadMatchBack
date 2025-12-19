/* ============================================================
   main.js - Lógica principal del front (JWT)
   ============================================================ */

const API_BASE = ""; // <-- rutas relativas
const path = window.location.pathname.split('/').pop();

function onDOM(selector, cb) {
    const el = document.querySelector(selector);
    if (el) cb(el);
}

function jsonResponse(res) {
    if (!res.ok) throw new Error(res.statusText || 'Error en la respuesta');
    return res.json();
}

function getToken() {
    return localStorage.getItem("token");
}

// ============================
// REGISTRO
// ============================
function handleRegister() {
    onDOM('#registerForm', form => {


        const passwordInput = form.querySelector('#password');
        const togglePassword = form.querySelector('#togglePassword');

        if (togglePassword) {
            togglePassword.addEventListener('change', () => {
                passwordInput.type = togglePassword.checked ? 'text' : 'password';
            });
        }
       
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                username: form.querySelector('#username').value.trim(),
                password: form.querySelector('#password').value,
                nombre: form.querySelector('#nombre').value.trim(),
                edad: Number(form.querySelector('#edad').value),
                carrera: form.querySelector('#carrera').value.trim(),
                descripcion: form.querySelector('#descripcion').value.trim(),
                instagram: form.querySelector('#instagram').value.trim()
            };

            if (!data.username || !data.password) return alert('Usuario y contraseña obligatorios.');
            if (isNaN(data.edad) || data.edad < 18 || data.edad > 100) return alert('Edad inválida (18-100).');

            try {
                const res = await fetch(`/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                await jsonResponse(res);

                alert('Registro exitoso. ¡Ahora podés explorar!');
                window.location.href = 'login.html';

            } catch (err) {
                console.error(err);
                alert('Error al registrar: ' + err.message);
            }
        });
    });
}

// ============================
// LOGIN
// ============================
function handleLogin() {
    onDOM('#loginForm', form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                username: form.querySelector('#username').value.trim(),
                password: form.querySelector('#password').value
            };

            try {
                const res = await fetch(`/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (data.success) {
                    localStorage.setItem("token", data.token);
                    window.location.href = 'explorar.html';
                } else {
                    alert('Login falló: ' + data.message);
                }

            } catch (err) {
                console.error('Error en fetch login:', err);
                alert('Login falló: ' + err.message);
            }
        });
    });
}

// ============================
// EXPLORAR PERFILES
// ============================
let perfiles = [];
let currentIndex = 0;

async function cargarPerfiles() {
    try {
        const token = getToken();

        const res = await fetch(`/api/auth/users`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            if (res.status === 401) return;
            throw new Error('Error al traer los perfiles');
        }

        perfiles = await res.json();
        currentIndex = 0;
        renderPerfil();
    } catch (err) {
        console.error(err);
        document.getElementById('perfilNombre').textContent = 'Error al cargar perfiles.';
    }
}

function renderPerfil() {
    const perfilCard = document.getElementById('perfilCard');
    const noMore = document.getElementById('noMore');

    if (!perfiles.length || currentIndex >= perfiles.length) {
        perfilCard.style.display = 'none';
        noMore.style.display = 'block';
        return;
    }

    const p = perfiles[currentIndex];

    perfilCard.style.display = 'block';
    noMore.style.display = 'none';

    document.getElementById('perfilNombre').textContent = p.nombre || p.username;
    document.getElementById('perfilMeta').textContent = `${p.edad} • ${p.carrera}`;
    document.getElementById('perfilDescripcion').textContent = p.descripcion || '';
}

function setupSkip() {
    onDOM('#skipBtn', btn => {
        btn.addEventListener('click', () => {
            currentIndex++;
            renderPerfil();
        });
    });
}

function setupLike() {
    onDOM('#likeBtn', btn => {
        btn.addEventListener('click', async () => {
            const perfil = perfiles[currentIndex];
            if (!perfil) return;

            try {
                const res = await fetch(`/api/like/${perfil.id}`, {
                    method: "POST",
                    headers: { 'Authorization': 'Bearer ' + getToken() }
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

// ============================
// LISTAR MATCHES
// ============================
async function cargarMatches() {
    try {
        const res = await fetch(`/api/match`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });

        const lista = await jsonResponse(res);

        const ul = document.getElementById('matchesList');
        const noMatches = document.getElementById('noMatches');

        if (!lista.length) {
            noMatches.style.display = 'block';
            ul.innerHTML = '';
            return;
        }

        noMatches.style.display = 'none';
        ul.innerHTML = '';

        const idsVistos = new Set();

        lista.forEach(m => {
            if (idsVistos.has(m.id)) return;
            idsVistos.add(m.id);

            const li = document.createElement('li');
            li.className = 'card perfil-card';
            li.innerHTML = `
              <div class="card-body">
                <h3>${m.nombre || m.username}, ${m.edad} años, ${m.carrera}</h3>
                <p>${m.descripcion || ''}</p>
                <p><strong>@${m.instagram}</strong></p>
              </div>
            `;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error(err);
        if (err.message.toLowerCase().includes('unauthorized')) {
            window.location.href = 'login.html';
        }
    }
}

// ============================
// Inicialización por página
// ============================
document.addEventListener('DOMContentLoaded', () => {
    if (path === 'register.html' || path === 'register') handleRegister();
    if (path.endsWith('login.html') || path === 'login') handleLogin();
    if (path.endsWith('explorar.html') || path === 'explorar') {
        cargarPerfiles();
        setupSkip();
        setupLike();
    }
    if (path === 'match.html' || path === 'match') cargarMatches();
    if (document.querySelector('#inputDescripcion')) inicializarPerfil();
});


// ============================
// 6) Actualizar info de perfil
// ============================
async function inicializarPerfil() {
    const inputDesc = document.getElementById('inputDescripcion');
    const previewDesc = document.getElementById('previewDescripcion');
    const inputIG = document.getElementById('inputInstagram');

    try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });

        if (!res.ok) throw new Error('No se pudieron cargar los datos del perfil');

        const user = await res.json();

        inputDesc.value = user.descripcion || '';
        previewDesc.textContent = user.descripcion || '';
        inputIG.value = user.instagram || '';

    } catch (err) {
        console.error(err);
        previewDesc.textContent = 'Error al cargar tu perfil';
    }

    onDOM('#btnActualizarPerfil', btn => {
        btn.addEventListener('click', async () => {
            const descripcion = inputDesc.value;
            const instagram = inputIG.value;

            try {
                const res = await fetch(`${API_BASE}/api/auth/profile`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },
                    body: JSON.stringify({ descripcion, instagram })
                });

                const data = await res.json();
                if (data.success) {
                    alert('Perfil actualizado!');
                    previewDesc.textContent = descripcion;
                } else {
                    throw new Error(data.message || 'Error al actualizar perfil');
                }
            } catch(err) {
                console.error(err);
                alert('Error al actualizar perfil.');
            }
        });
    });
}

