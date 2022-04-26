const express = require('express');
const bp = require('body-parser');
const { getProducts, getProduct, getRelated, getProductStyles } = require('./handlers.js');

const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.get('/products', getProducts);
app.get('/products/:product_id', getProduct);
app.get('/products/:product_id/styles', getProductStyles);
app.get('/products/:product_id/related', getRelated);

const port = 3000;

app.listen(port, function() {
  console.log(`listening on port ${port}`);
});