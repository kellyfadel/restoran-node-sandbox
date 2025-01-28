const path = require('path');

const express = require('express');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');

const menu = require('./data/menu.json');


const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/temp', (req, res) => {
    res.render('temp', { title: 'Temp' });
});

app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/menu', (req, res) => {
    res.render('menu', { title: 'Menu', selectedCategory: 'breakfast', data: menu });
});

app.get('/menu/:category', (req, res) => {
    const category = req.params.category;
    res.render('menu', { title: 'Menu', selectedCategory: category, data: menu });
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});