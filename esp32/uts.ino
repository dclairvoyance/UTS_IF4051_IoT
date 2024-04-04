#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Keypad.h>
#include <WiFi.h>
#include <PubSubClient.h>

// display
#define OLED_ADDR 0x3C
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// keypad
#define ROW_NUM 4    // four rows
#define COLUMN_NUM 4 // four columns
char keys[ROW_NUM][COLUMN_NUM] = {
    {'1', '2', '3', 'A'},
    {'4', '5', '6', 'B'},
    {'7', '8', '9', 'C'},
    {'*', '0', '#', 'D'}};
byte pin_rows[ROW_NUM] = {13, 12, 14, 27};
byte pin_column[COLUMN_NUM] = {26, 25, 33, 32};
Keypad keypad = Keypad(makeKeymap(keys), pin_rows, pin_column, ROW_NUM, COLUMN_NUM);

// led
#define LED_PIN 2

// mqtt
const char *ssid = "B101";
const char *password = "ninjamask";
const char *mqtt_server = "broker.mqtt-dashboard.com";

WiFiClient espClient;
PubSubClient client(espClient);
#define MSG_BUFFER_SIZE (255)
char msg[MSG_BUFFER_SIZE];

// local variables keypad
bool pin_mode = false;
String pin = "";
String pin_old = "";
String pin_new = "";
char last_key = '\0';
String amount = "";

// local variables led
int frequency = 10;
int time_frame = 5000;
unsigned long last_time_led = 0;
unsigned long last_time_led_blink = 0;
unsigned long last_time_publish = 0;
unsigned long interval = 1000 / frequency;

// other local variables
// 0 = none, 1 = success, 2 = fail, 3 = balance
int transaction_state = 0;
String payload_str;
String balance;

// dynamic variables
const int rfid_id = 1;

// hash function (lib)
unsigned int fnv1aHash(const String &str)
{
  const unsigned int fnv_offset_basis = 2166136261U;
  const unsigned int fnv_prime = 16777619U;

  unsigned int hash = fnv_offset_basis;

  for (size_t i = 0; i < str.length(); ++i)
  {
    hash ^= (unsigned int)str[i];
    hash *= fnv_prime;
  }

  return hash % 10000;
}

void setup()
{
  // mqtt
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // led
  pinMode(LED_PIN, OUTPUT);

  // display
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display_help();
}

void setup_wifi()
{
  // mqtt
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect()
{
  // mqtt
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    String clientId = "UTS-IOT-13520035";
    if (client.connect(clientId.c_str()))
    {
      Serial.println("connected");

      // kasus: ESP32 hanya sebagai reader-1 sekaligus account-1
      client.publish("imalive", "imalive 1");
      client.subscribe("merchant-1");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void display_help()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("1. Cek Saldo");
  display.println("2. Pembayaran");
  display.println("3. Ganti PIN");
  display.println("Tekan keypad!");
  display.display();
}

void display_balance()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Cek Saldo");
  display.println("Masukkan PIN!");
  display.println("(* ulang | # kirim)");
  display.display();
}

void display_payment(String amount)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Pembayaran");
  display.println("Masukkan jumlah!");
  display.println("(* ulang | # kirim)");
  display.println("Rp" + amount);
  display.display();
}

void display_changepin()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Ganti PIN");
  display.println("Masukkan PIN lama!");
  display.println("(* ulang | # kirim)");
  display.display();
}

void display_balance_pin(String pin)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Cek Saldo");
  display.println("Masukkan PIN!");
  display.println("(* ulang | # kirim)");
  String pin_mask = "";
  for (int i = 0; i < pin.length(); i++)
  {
    pin_mask += "*";
  }
  display.println(pin_mask);
  display.display();
}

void display_payment_pin(String amount, String pin)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Pembayaran Rp" + amount);
  display.println("Masukkan PIN!");
  display.println("(* ulang | # kirim)");
  String pin_mask = "";
  for (int i = 0; i < pin.length(); i++)
  {
    pin_mask += "*";
  }
  display.println(pin_mask);
  display.display();
}

void display_balance_final(String balance)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Saldo");
  display.println("Rp" + balance);
  display.println("Tekan * kembali!");
  display.display();
}

void display_payment_success(String balance)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Transaksi Berhasil");
  display.println("Sisa Saldo:");
  display.println("Rp" + balance);
  display.println("Tekan * kembali!");
  display.display();
}

void display_payment_fail()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Transaksi Gagal");
  display.println("Saldo tidak mencukupi");
  display.println("Tekan * kembali!");
  display.display();
}

void display_changepin_old(String pin_old)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Ganti PIN");
  display.println("Masukkan PIN lama!");
  display.println("(* ulang | # kirim)");
  display.println(pin_old);
  display.display();
}

void display_changepin_new(String pin_new)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Ganti PIN");
  display.println("Masukkan PIN baru!");
  display.println("(* ulang | # kirim)");
  display.println(pin_new);
  display.display();
}

void display_changepin_success()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Ganti PIN Berhasil!");
  display.println("Tekan * kembali!");
  display.display();
}

void display_changepin_fail()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Ganti PIN Gagal!");
  display.println("(PIN lama salah)");
  display.print("Kembali dalam ");
  display.display();
  for (int i = 5; i > 0; i--)
  {
    display.setCursor(82 + 8 * (5 - i), 16);
    display.print(i);
    display.display();
    delay(1000);
  }
  display_changepin();
}

void display_balance_wrongpin()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Cek Saldo Gagal!");
  display.println("(PIN salah)");
  display.print("Kembali dalam ");
  display.display();
  for (int i = 5; i > 0; i--)
  {
    display.setCursor(82 + 8 * (5 - i), 16);
    display.print(i);
    display.display();
    delay(1000);
  }
  display_balance_pin(pin);
}

void display_transaction_wrongpin()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Transaksi Gagal!");
  display.println("(PIN salah)");
  display.print("Kembali dalam ");
  display.display();
  for (int i = 5; i > 0; i--)
  {
    display.setCursor(82 + 8 * (5 - i), 16);
    display.print(i);
    display.display();
    delay(1000);
  }
  display_payment_pin(amount, pin);
}

void display_process()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Mohon tunggu!");
  display.display();
}

// ada pesan dari broker ke ESP32: balance, transaction success/fail
// esp32 hanya subscribe ke merchant-1
void callback(char *topic, byte *payload, unsigned int length)
{
  payload_str = "";
  balance = "";
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++)
  {
    Serial.print((char)payload[i]);
    payload_str += (char)payload[i];
  }
  Serial.println();

  // if balance wrongpin
  if (payload_str.startsWith("balance wrongpin"))
  {
    display_balance_wrongpin();
  }
  // else if balance
  else if (payload_str.startsWith("balance"))
  {
    balance = payload_str.substring(8);
    transaction_state = 3;
    pin_mode = false;
    last_key = '\0';
    display_balance_final(balance);
  }
  // else if transaction wrongpin
  else if (payload_str.startsWith("transaction wrongpin"))
  {
    display_transaction_wrongpin();
  }
  // else if transaction success
  else if (payload_str.startsWith("transaction success"))
  {
    pin_mode = false;
    last_key = '\0';
    amount = "";
    transaction_state = 1;
    balance = payload_str.substring(20);
    last_time_led = millis();
    display_payment_success(balance);
  }
  // else if transaction fail
  else if (payload_str.startsWith("transaction fail"))
  {
    pin_mode = false;
    last_key = '\0';
    amount = "";
    transaction_state = 2;
    last_time_led = millis();
    last_time_led_blink = millis();
    display_payment_fail();
  }
  // else if change pin success
  else if (payload_str.startsWith("changepin success"))
  {
    last_key = '\0';
    display_changepin_success();
  }
  // else if change pin fail
  else if (payload_str.startsWith("changepin fail"))
  {
    display_changepin_fail();
  }
}

void loop()
{
  // handle mqtt connection
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  // handle key press
  char key = keypad.getKey();

  if (key)
  {
    // if cek saldo
    if (key == '1' && last_key == '\0')
    {
      last_key = key;
      pin_mode = true;
      display_balance();
    }
    // else if pembayaran
    else if (key == '2' && last_key == '\0')
    {
      last_key = key;
      display_payment(amount);
    }
    // else if ganti pin
    else if (key == '3' && last_key == '\0')
    {
      last_key = key;
      display_changepin();
    }

    // cek pin untuk if cek saldo
    else if (last_key == '1')
    {
      if (key == '*' && pin != "")
      {
        pin = "";
        display_balance_pin(pin);
      }
      else if (key == '*' && pin == "")
      {
        pin_mode = false;
        last_key = '\0';
        display_help();
      }
      else if (key == '#')
      {
        snprintf(msg, MSG_BUFFER_SIZE, "balance %d %s", rfid_id, pin);
        String topic_publish = "reader-";
        topic_publish += rfid_id;
        client.publish(topic_publish.c_str(), msg);
        pin = "";
        display_process();
      }
      else
      {
        pin += key;
        display_balance_pin(pin);
      }
    }
    // tambah amount untuk if payment dan belum pin_mode
    else if (last_key == '2' && !pin_mode)
    {
      if (key == '*' && amount != "")
      {
        amount = "";
        display_payment(amount);
      }
      else if (key == '*' && amount == "")
      {
        last_key = '\0';
        display_help();
      }
      else if (key == '#')
      {
        pin_mode = true;
        display_payment_pin(amount, pin);
      }
      else
      {
        amount += key;
        display_payment(amount);
      }
    }
    // cek pin untuk if payment dan sudah pin_mode
    else if (last_key == '2' && pin_mode)
    {
      if (key == '*' && pin != "")
      {
        pin = "";
        display_payment_pin(amount, pin);
      }
      else if (key == '*' && pin == "")
      {
        pin_mode = false;
        display_payment(amount);
      }
      else if (key == '#')
      {
        snprintf(msg, MSG_BUFFER_SIZE, "transaction %d %s %s", rfid_id, amount, pin);
        String topic_publish = "reader-";
        topic_publish += rfid_id;
        client.publish(topic_publish.c_str(), msg);
        pin = "";
        display_process();
      }
      else
      {
        pin += key;
        display_payment_pin(amount, pin);
      }
    }
    // cek pin lama if ganti pin dan belum pin baru
    else if (last_key == '3' && !pin_mode)
    {
      if (key == '*' && pin_old != "")
      {
        pin_old = "";
        display_changepin_old(pin_old);
      }
      else if (key == '*' && pin == "")
      {
        last_key = '\0';
        display_help();
      }
      else if (key == '#')
      {
        pin_mode = true;
        display_changepin_new(pin_new);
        amount = "";
      }
      else
      {
        pin_old += key;
        display_changepin_old(pin_old);
      }
    }
    // cek pin lama if ganti pin dan sudah pin baru
    else if (last_key == '3' && pin_mode)
    {
      if (key == '*' && pin_new != "")
      {
        pin_new = "";
        display_changepin_new(pin_new);
      }
      else if (key == '*' && pin_new == "")
      {
        pin_mode = false;
        display_changepin_old(pin_old);
      }
      else if (key == '#')
      {
        pin_mode = false;
        snprintf(msg, MSG_BUFFER_SIZE, "changepin %d %s %s", rfid_id, pin_old, pin_new);
        String topic_publish = "reader-";
        topic_publish += rfid_id;
        client.publish(topic_publish.c_str(), msg);
        display_process();
        pin_new = "";
        pin_old = "";
      }
      else
      {
        pin_new += key;
        display_changepin_new(pin_new);
      }
    }
    // else if display final
    else if (key == '*')
    {
      transaction_state = 0;
      display_help();
    }
  }

  // handle transaction (led)
  unsigned long current_time = millis();
  // if transaction success
  if (transaction_state == 1)
  {
    digitalWrite(LED_PIN, HIGH);
    if (current_time - last_time_led >= time_frame)
    {
      digitalWrite(LED_PIN, LOW);
      transaction_state = 0;
    }
  }
  // else if transaction fail
  else if (transaction_state == 2)
  {
    if (current_time - last_time_led_blink >= interval)
    {
      last_time_led_blink = current_time;
      digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    }
    else if (current_time - last_time_led >= time_frame)
    {
      digitalWrite(LED_PIN, LOW);
      transaction_state = 0;
    }
  }
}