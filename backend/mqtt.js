import mqtt from "mqtt";
import {
  getBalance,
  updateBalance,
  addTransaction,
  validatePin,
  changePin,
} from "./database.js";
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
      const [_, rfidId, pin] = message.toString().split(" ");
      const readerId = topic.toString().split("-")[1];
      if (!(await validatePin(rfidId, pin))) {
        console.log(`Invalid pin for rfid-${rfidId}`);
        client.publish("merchant-" + readerId, "balance wrongpin");
      } else {
        const data = await getBalance(rfidId);
        const balance = data.balance;
        console.log(`Fetched balance for rfid-${rfidId}: ${balance}`);
        client.publish(
          "merchant-" + readerId,
          `balance ${addThousandSeparators(balance)}`
        );
      }
    }
    // else if message is transaction, process and publish status
    // format message: transaction rfidId amount
    else if (message.toString().startsWith("transaction")) {
      const [_, rfidId, amount, pin] = message.toString().split(" ");
      const readerId = topic.toString().split("-")[1];
      if (!(await validatePin(rfidId, pin))) {
        console.log(`Invalid pin for rfid-${rfidId}`);
        client.publish("merchant-" + readerId, "transaction wrongpin");
      } else {
        const data = await getBalance(rfidId);
        const balance = data.balance;
        console.log(`Fetched balance for rfid-${rfidId}: ${balance}`);
        if (balance < amount) {
          console.log(`Insufficient balance for rfid-${rfidId}`);
          client.publish("merchant-" + readerId, "transaction fail");
        } else {
          console.log(
            `Sufficient balance for rfid-${rfidId}, balance left: Rp${addThousandSeparators(
              balance - amount
            )}`
          );
          await updateBalance(rfidId, -amount);
          client.publish(
            "merchant-" + readerId,
            `transaction success ${addThousandSeparators(balance - amount)}`
          );
        }
      }
    }
    // else if message is changepin, process and publish status
    // format message: changepin rfidId pinOld pinNew
    else if (message.toString().startsWith("changepin")) {
      const [_, rfidId, pinOld, pinNew] = message.toString().split(" ");
      const data = await changePin(pinOld, pinNew);
      const status = data.status;
      console.log(
        `Attempted to change pin for rfid-${rfidId} with status ${status}`
      );
      const readerId = topic.toString().split("-")[1];
      client.publish("merchant-" + readerId, `changepin ${status}`);
    }
  }
});
