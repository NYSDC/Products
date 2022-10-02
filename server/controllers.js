const db = require('../db');

const getProducts = (req, res) => {
  // console.log(req.query);
  const page = (req.query.page > 0) ? req.query.page : 1;
  const count = (req.query.count > 0) ? req.query.count : 5;

  const start = Date.now();

  // db.query('SELECT * FROM products;', [])
  db.query('SELECT id, name, slogan, description, category, default_price::numeric FROM products WHERE id > $1 LIMIT $2;', [(page - 1) * count, count])
  .then((response) => {
    const queryDuration = Date.now() - start;

    console.log(`getProducts page=${page} count=${count} queryDuration = ${queryDuration} ms`);

    response.rows.forEach((row) => {
      row.default_price = parseInt(row.default_price);
    });

    res.json(response.rows);
    // res.send('hello world');
    // db.end();
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json(error);
  });
};

const getProduct = (req, res) => {
  const productId = req.params.product_id;

  const start = Date.now();

  db.query('SELECT id, name, slogan, description, category, default_price::numeric, (SELECT jsonb_agg(nested_features) FROM (SELECT feature, value FROM features WHERE product_id = $1) AS nested_features) AS features FROM products WHERE id = $1;', [productId])
  .then((response) => {
    const queryDuration = Date.now() - start;
    console.log(`getProduct id=${productId}, queryDuration = ${queryDuration} ms'`);

    const result = response.rows.length > 0 ? response.rows[0] : {};
    res.json(result);
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json(error);
  });
};

const getRelated = (req, res) => {
  const productId = req.params.product_id;

  const query = {
    text: 'SELECT related_product_id FROM related WHERE current_product_id = $1;',
    values: [productId],
    rowMode: 'array',
  }

  let result = {};
  const start = Date.now();

  db.query(query)
  .then((response) => {
    const queryDuration = Date.now() - start;

    console.log(`getRelated productId=${productId}, queryDuration = ${queryDuration} ms'`);
    res.json(response.rows.flat());
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json(error);
  });

};

const getProductStyles = (req, res) => {
  const productId = req.params.product_id;

  const result = { product_id: productId };
  const start = Date.now();

  //using prepared statement
  // const query = {
  //   name: 'fetch-product-styles',
  //   text: 'SELECT st.id as style_id, st.name as name, st.original_price::numeric as original_price, st.sale_price::numeric as sale_price, st.default_style as default_style, sk.id as sku_id, sk.size as size, sk.quantity as quantity, p.url as url, p.thumbnail_url as thumbnail_url FROM styles st, skus sk, photos p WHERE st.product_id = $1 AND sk.style_id = st.id AND p.style_id = st.id;',
  //   values: [productId],
  // }

  db.query('SELECT st.id as style_id, st.name as name, st.original_price::numeric as original_price, st.sale_price::numeric as sale_price, st.default_style as default_style, sk.id as sku_id, sk.size as size, sk.quantity as quantity, p.id as photo_id, p.url as url, p.thumbnail_url as thumbnail_url FROM styles st, skus sk, photos p WHERE st.product_id = $1 AND sk.style_id = st.id AND p.style_id = st.id ORDER BY st.id ASC;', [productId])
  .then((response) => {
    let queryDuration = Date.now() - start;

    console.log(`getProductStyles productId=${productId}, queryDuration = ${queryDuration} ms'`);
    // console.log(response.rows.length);

    //create style objects
    result.results = response.rows.reduce((styleObjects, row) => {
      const styleIdExists = (obj) => {
        return obj.style_id === row.style_id;
      };

      if (!styleObjects.some(styleIdExists)) {
        const styleObj = {
          style_id: row.style_id,
          name: row.name,
          original_price: parseInt(row.original_price),
          sale_price: parseInt(row.sale_price),
        };
        styleObj['default?'] = row.default_style;
        styleObjects.push(styleObj);
      }

      return styleObjects;
    }, []);

    //add photos to each style object
    const photoIds = [];
    result.results.forEach((styleObject) => {
      styleObject.photos = response.rows.reduce((photos, row) => {
        if ((photoIds.indexOf(row.photo_id) === -1) && (row.style_id === styleObject.style_id)) {
          photoIds.push(row.photo_id);
          photos.push({
            url: row.url,
            thumbnail_url: row.thumbnail_url,
          });
        }
        return photos;
      }, []);
    });

    //add skus to each style object
    const skuIds = [];
    result.results.forEach((styleObject) => {
      styleObject.skus = {};
      response.rows.forEach((row) => {
        if ((skuIds.indexOf(row.sku_id) === -1) && (row.style_id === styleObject.style_id)) {
          skuIds.push(row.sku_id);
          styleObject.skus[row.sku_id] = {
            quantity: row.quantity,
            size: row.size,
          };
        }
      });
    });

    queryDuration = Date.now() - start;
    console.log(`getProductStyles productId=${productId}, total process duration = ${queryDuration} ms'`);
    res.json(result);
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json(error);
  });
}

const getCart = (req, res) => {
  const userSession = req.params.user_session;

  const start = Date.now();

  db.query('SELECT product_id AS sku_id, count(product_id) AS count FROM cart WHERE user_session = $1 GROUP BY product_id;', [userSession])
  .then((response) => {
    const queryDuration = Date.now() - start;

    console.log(`getCart user session = ${userSession} queryDuration = ${queryDuration} ms`);

    response.rows.forEach((row) => {
      row.count = parseInt(row.count);
    });

    res.json(response.rows);
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json(error);
  });
}

const postCart = (req, res) => {
  const userSession = req.body.user_token;
  const productId = req.body.sku_id;

  const start = Date.now();
  db.query('INSERT INTO cart (user_session, product_id, active) VALUES ($1, $2, $3);', [userSession, productId, true])
  .then((response) => {
    const queryDuration = Date.now() - start;
    console.log(`postCart user session = ${userSession}, product id = ${productId}, queryDuration = ${queryDuration} ms`);

    if (response.rowCount === 1) {
      res.sendStatus(201);
    } else {
      throw 'Insert query error at postCart';
    }
  })
  .catch((error) => {
    console.log(error);
    res.status(500).json(error);
  });
}

module.exports = {
  getProducts,
  getProduct,
  getRelated,
  getProductStyles,
  getCart,
  postCart,
};