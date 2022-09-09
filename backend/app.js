// import des modules npm - Ajout des plugins externes
const express = require('express');
const bodyParser = require('body-parser');

// On importe mongoose pour pouvoir utiliser la base de données
const mongoose = require('mongoose');

const path = require('path');


// On importe le router 4
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');


// Récupération de la liste de Message

mongoose.connect('mongodb+srv://openclassrooms_p7_messages:CsQgdU2Ak7mZTRB@cluster0.lkq4bay.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création d'une application express Ajoutez des middlewares 3
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;