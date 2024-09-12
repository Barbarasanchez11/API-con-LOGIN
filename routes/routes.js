const express = require('express');
const router = express.Router();
const session = require('express-session');
const axios = require('axios');
const { generateToken, verifyToken } = require('../middlewares/middleware');
const users = require('../data/users');
const urlBase = 'https://rickandmortyapi.com/api/character';

router.get('/', (req, res) => {
    if (!req.session.token) {
        const loginForm = `
        <form action="/login" method="post">
          <label for="username">Usuario:</label>
          <input type="text" id="username" name="username" required><br>
      
          <label for="password">Contraseña:</label>
          <input type="password" id="password" name="password" required><br>
      
          <button type="submit">Iniciar sesión</button>
        </form>
        `;
        res.send(loginForm);
    } else { 
        res.send(`
            <h1>Bienvenido</h1>
            <a href="/search">Buscar</a>
            <form action="/logout" method="post">
              <button type="submit">Cerrar sesión</button>
            </form>
        `);
    }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body; 
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        res.status(401).json({ message: 'Usuario incorrecto' });
    } else {
        const token = generateToken(user);
        req.session.token = token;
        res.redirect('/search');
    }
});

router.get('/search', verifyToken, (req, res) => {
    res.send(`
        <form action="/character" method="get">
            <label for="search">Buscar personaje:</label>
            <input type="text" id="search" name="search" required>
            <button type="submit">Buscar</button>
        </form>
        <form action="/logout" method="post">
            <button type="submit">Cerrar sesión</button>
        </form>
    `);
});

router.get('/character', verifyToken, async (req, res) => {
    const search = req.query.search;
    try {
        const response = await axios.get(`${urlBase}/?name=${search}`);
        const characters = response.data.results;

        const charactersList = characters.map(character => {
            const { name, image, status, gender, species, origin: { name: origin } } = character;
            return `${name}  ${status}  ${gender}  ${species} <img src="${image}" alt="${name}">`;
        });

        res.send(`${charactersList.join('')}`);
        console.log(charactersList);
    } catch (err) {
        res.status(500).json({ mensaje: `Personaje no encontrado, ${err}` });
    }
});

router.get('/character/:nombre', verifyToken, async (req, res) => {
    const name = req.params.nombre;
    try {
        const response = await axios.get(`${urlBase}?name=${name}`);
        const character = response.data.results;

       
        const { name: characterName, status, gender, species, image, origin: { name: origin } } = character;
        const characterInfo = `
            <h2>${characterName}</h2>
            <img src="${image}" alt="${characterName}">
            <ul>
                <li><strong>Status:</strong> ${status}</li>
                <li><strong>Género:</strong> ${gender}</li>
                <li><strong>Especie:</strong> ${species}</li>
                <li><strong>Origen:</strong> ${origin}</li>
            </ul>
            <form action="/logout" method="post">
                <button type="submit">Cerrar sesión</button>
            </form>
            <a href="/">Volver a la página principal</a>
        `;
        res.send(characterInfo);
    } catch (err) {
        res.status(500).json({ error: `Error al buscar el personaje: ${err}` });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(); 
    res.redirect('/');
});

module.exports = router;
