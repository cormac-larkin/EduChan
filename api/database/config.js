import pg from "pg";
import "dotenv/config";

const {Pool} = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.NODE_ENV === "test" ? process.env.TEST_DB : process.env.DEV_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
