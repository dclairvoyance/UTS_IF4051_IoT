import mqtt from "mqtt";
import { getBalance } from "./database.js";
import { addThousandSeparators } from "./helpers.js";
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  // imalive gathers all readers
  client.subscribe("imalive");
});

client.on("message", async (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);

  // if topic is imalive, subscribe to the reader topic
  if (topic === "imalive") {
    // format message: imalive readerId
    const readerId = message.toString().split(" ")[1];
    client.subscribe("reader-" + readerId);
    console.log(`Subscribed to topic: reader-${readerId}`);
  }
  // else if topic is reader-readerId
  else if (topic.startsWith("reader-")) {
    // if message is balance, get balance and publish it
    // format message: balance rfidId
    if (message.toString().startsWith("balance")) {
      const rfidId = message.toString().split(" ")[1];
      const data = await getBalance(rfidId);
      const balance = data.balance;
      console.log(`Fetched balance for rfid-${rfidId}: ${balance}`);
      const readerId = topic.toString().split("-")[1];
      client.publish(
        "merchant-" + readerId,
        message.toString() + " " + balance.toString()
      );
    }
    // else if message is transaction, process and publish status
    // format message: transaction rfidId amount
    else if (message.toString().startsWith("transaction")) {
      const [_, rfidId, amount] = message.toString().split(" ");
      const data = await getBalance(rfidId);
      const balance = data.balance;
      console.log(`Fetched balance for rfid-${rfidId}: ${balance}`);
      if (balance < amount) {
        console.log(`Insufficient balance for rfid-${rfidId}`);
        const readerId = topic.toString().split("-")[1];
        client.publish("merchant-" + readerId, "SALDO TIDAK MENCUKUPI");
      } else {
        console.log(`Sufficient balance for rfid-${rfidId}`);
        const readerId = topic.toString().split("-")[1];
        await updateBalance(rfidId, -amount);
        await addTransaction(rfidId, -amount);
        client.publish(
          "merchant-" + readerId,
          `TRANSAKSI BERHASIL, SISA SALDO Rp${addThousandSeparators(
            balance - amount
          )}`
        );
      }
    }
  }
});
