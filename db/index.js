require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER ? process.env.DB_USER : process.env.DBUSER,
  host: process.env.DB_HOST ? process.env.DB_HOST : process.env.DBHOST,
  database: process.env.DB_NAME ? process.env.DB_NAME : process.env.DBDATABASE,
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : process.env.DBPASSWORD,
  port: process.env.DB_PORT ? process.env.DB_PORT : process.env.DBPORT,
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
