import express from "express";
import {
  getAccounts,
  getBalance,
  updateBalance,
  getTransactions,
  getTransactionsByAccountId,
  addTransaction,
} from "./database.js";

const app = express();
const port = 5001;

app.use(express.json());

app.get("/accounts", async (req, res) => {
  try {
    const accounts = await getAccounts();
    res.json(accounts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/accounts/get_balance/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const balance = await getBalance(id);
    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/accounts/update_balance/:id", async (req, res) => {
  try {
    console.log(req.body);
    const { id } = req.params;
    const { amount } = req.body;
    const updatedAccount = await updateBalance(id, amount);
    res.json(updatedAccount);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/transactions", async (req, res) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/transactions/account/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await getTransactionsByAccountId();
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/transactions/add", async (req, res) => {
  try {
    const { id, amount } = req.body;
    const transaction = await addTransaction(id, amount);
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
