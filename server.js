'use strict';

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const superagent = require('superagent');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 5000;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/', homeHandler);
function homeHandler(req, res) {
    let url = 'https://digimon-api.vercel.app/api/digimon';
    superagent.get(url)
        .then((data) => {
            let arrUrl = data.body.map((vals) => {
                return new Digimon(vals);
            })
            res.render('pages/index', { data: arrUrl });
        })
}
function Digimon(vals) {
    this.name = vals.name || 'no name';
    this.img = vals.img || 'no img';
    this.level = vals.level || 'no level';
}

app.get('/addToDb', addToDbHandler);
function addToDbHandler(req, res) {
    let { name, img, level } = req.query;
    let sql = 'INSERT INTO  digimonss (name,img,level)VALUES($1,$2,$3);';
    let safeVals = [name, img, level];
    client.query(sql, safeVals)
        .then(() => {
            res.redirect('/selectData');
        });
}

app.get('/selectData', selectDataHandler);
function selectDataHandler(req, res) {
    let sql = 'SELECT * FROM digimonss;';
    client.query(sql)
        .then((value) => {
            res.render('pages/favorite', { val: value.rows });
        });
}


function notFoundHandler(req, res) {
    res.status(404).send('Not Found 404');
}

function errorHandler(error, req, res) {
    res.status(500).send(error);
}

client.connect()
    .then(() => {
        app.listen(PORT, console.log(`run on port ${PORT}`));
    })
app.use('*', notFoundHandler)