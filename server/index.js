// require('newrelic'); //comment out if you don't need new relic tracking
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bp = require('body-parser');
const { getProducts, getProduct, getRelated, getProductStyles, getCart, postCart } = require('./controllers.js');

const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static('public'));

app.get('/products', getProducts);
app.get('/products/:product_id', getProduct);
app.get('/products/:product_id/styles', getProductStyles);
app.get('/products/:product_id/related', getRelated);
app.get('/cart/:user_session', getCart);
app.post('/cart', postCart);

app.get('/docker', (req, res) => {
  res.send(`Test Docker ${process.env.DBHOST} ${process.env.DB_HOST}.`);
});

const port = 3000;

app.listen(port, function() {
  console.log(`listening on port ${port}`);
});