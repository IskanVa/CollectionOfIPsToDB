const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  password: "!QAZxsw2",
  host: "localhost",
  port: 5432,
  database: "nasrat",
});

module.exports = pool;
