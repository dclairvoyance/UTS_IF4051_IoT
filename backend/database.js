import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  host: process.env.PSQL_HOST,
  user: process.env.PSQL_USER,
  database: process.env.PSQL_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function getAccounts() {
  const result = await pool.query("SELECT * FROM accounts");
  return result.rows;
}

async function getBalance(accountId) {
  const result = await pool.query(
    "SELECT balance FROM accounts WHERE id = $1",
    [accountId]
  );
  return { balance: result.rows[0].balance };
}

async function updateBalance(accountId, amount) {
  const result = await pool.query(
    "UPDATE accounts SET balance = balance + $2 WHERE id = $1 RETURNING *",
    [accountId, amount]
  );
  return result.rows[0];
}

async function getTransactions() {
  const result = await pool.query("SELECT * FROM transactions");
  return result.rows;
}

async function getTransactionsByAccountId(accountId) {
  const result = await pool.query(
    "SELECT * FROM transactions WHERE account_id = $1",
    [accountId]
  );
  return result.rows;
}

async function addTransaction(accountId, amount) {
  const result = await pool.query(
    "INSERT INTO transactions (account_id, amount) VALUES ($1, $2) RETURNING *",
    [accountId, amount]
  );
  return result.rows[0];
}

export {
  getAccounts,
  getBalance,
  updateBalance,
  getTransactions,
  getTransactionsByAccountId,
  addTransaction,
};
