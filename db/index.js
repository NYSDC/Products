require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST,
  database: process.env.DBDATABASE,
  password: process.env.DBPASSWORD,
  port: process.env.DBPORT,
});

const query = (query, params) => {
  return pool.query(query, params);
};

const end = () => {
  return pool.end();
}

module.exports = {
  query,
  end,
};