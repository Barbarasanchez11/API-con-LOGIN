const express = require('express')
const router = express.Router()
const session = require('express-session')
const axios = require('axios')
const {generateToken, verifyToken} = require('../middlewares/middleware')
const users = require('../data/users')
const urlBase = 'https://rickandmortyapi.com/api/character'

router.get('/', (req, res) => {
    if(req.session.token) {
      res.send(`
      <h1>Bienvendido</h1>
      <a href="/search">search</a>
      <form action="/logout" method="post">
        <button type="submit">Cerrar sesion</button>
      </form>
      `)
    } else { 
      const loginForm = `
      <form action="/login" method="post">
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" required><br>
    
        <label for="password">Contraseña:</label>
        <input type="password" id="password" name="password" required><br>
    
        <button type="submit">Iniciar sesión</button>
      </form>
    
      <a href="/character">characters</a>
      `;
    
      res.send(loginForm)}
    })
      /*res.send(`<a href="/search">Buscar personaje</a> <form method="post" action="/logout"><button type="submit">Logout</button></form>`); 
    } else { res.send(
        ` <form method="post" action="/login"> 
        <input type="text" name="username" placeholder="Usuario" required /> 
        <input type="password" name="password" placeholder="Contraseña" required /> 
        <button type="submit">Login</button> </form> `)
    } );*/
  

  router.get('/search', async (req,res) => {
    const search = req.params.search
    try {
        const response = await axios.get(`${urlBase}/?name=${search}`)
        const characters = response.data.results
    
        const charactersList = characters.map(character => {
          const { name, status, gender, species, image, origin: {name: origin} } = character
          return { name, status, gender, species, image, origin }
        })
        res.json(charactersList)
      } catch(err) {
        res.status(500).json({mensaje: `personaje no encontrado, ${err}`})
      }
    })


router.post('/login',(req,res) => {
    const {username, password} = req.body 
    const user = users.find(user => user.username === username && user.password === password)
    console.log("Received password:", password);

    if(!user) {
        res.status(401).json({message: 'Incorrect user'})
    } else {
        const token = generateToken(user) 
        req.session.token = token
        res.redirect('/search')
    }

})

router.get('/character', verifyToken, (req,res) => {
    const userId = req.user; 
    const user = users.find(user => user.id === userId);
    if (!user) {
        res.status(401).json({message: 'User not found'})
    } else {
        const form = `
            <h1>Welcome, ${user.name}! </h1>
            <p>ID: ${user.id} </p>
            <p>User: ${user.username} </p>
            <br>
            <form action="/logout" method="post">
                <button type="submit">Log out</button>
            </form>
            <a href="/">Home</a>
        `
        res.send(form)
    }
})


   
router.post('/logout', (req,res) => {
    req.session.destroy(); 
    res.redirect('/')
})











module.exports = router