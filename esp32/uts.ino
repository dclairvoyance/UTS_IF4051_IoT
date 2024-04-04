#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Keypad.h>

#define OLED_ADDR 0x3C
Adafruit_SSD1306 display(128, 64, &Wire, -1);

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

bool pin_mode = false;
String pin = "";
char last_key = '\0';
String amount = "";

void setup()
{
  Serial.begin(9600);
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display_help();
}

void display_help()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("1. Cek Saldo");
  display.println("2. Transfer");
  display.println("Tekan keypad!");
  display.display();
}

void display_saldo()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Cek Saldo");
  display.println("Masukkan pin!");
  display.println("(* ulang | # kirim)");
  display.display();
}

void display_transfer(String amount)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Transfer");
  display.println("Masukkan jumlah!");
  display.println("(* ulang | # kirim)");
  display.println("Rp" + amount);
  display.display();
}

void display_saldo_pin(String pin)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Cek Saldo");
  display.println("Masukkan pin!");
  display.println("(* ulang | # kirim)");
  String pin_mask = "";
  for (int i = 0; i < pin.length(); i++)
  {
    pin_mask += "*";
  }
  display.println(pin_mask);
  display.display();
}

void display_transfer_pin(String amount, String pin)
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Transfer Rp" + amount);
  display.println("Masukkan pin!");
  display.println("(* ulang | # kirim)");
  String pin_mask = "";
  for (int i = 0; i < pin.length(); i++)
  {
    pin_mask += "*";
  }
  display.println(pin_mask);
  display.display();
}

void loop()
{
  char key = keypad.getKey();

  if (key)
  {
    // if cek saldo
    if (key == '1' && last_key == '\0')
    {
      last_key = key;
      pin_mode = true;
      display_saldo();
    }
    // else if transfer
    else if (key == '2' && last_key == '\0')
    {
      last_key = key;
      display_transfer(amount);
    }

    // cek pin untuk if cek saldo
    else if (last_key == '1')
    {
      if (key == '*' && pin != "")
      {
        pin = "";
        display_saldo_pin(pin);
      }
      else if (key == '*' && pin == "")
      {
        last_key = '\0';
        display_help();
      }
      else if (key == '#')
      {
        // send
        pin_mode = false;
        pin = "";
        last_key = '\0';
      }
      else
      {
        pin += key;
        display_saldo_pin(pin);
      }
    }
    // cek pin untuk if transfer
    else if (last_key == '2' && pin_mode)
    {
      if (key == '*' && pin != "")
      {
        pin = "";
        display_transfer_pin(amount, pin);
      }
      else if (key == '*' && pin == "")
      {
        pin_mode = false;
        display_transfer(amount);
      }
      else if (key == '#')
      {
        // send
        pin_mode = false;
        pin = "";
        last_key = '\0';
        amount = "";
      }
      else
      {
        pin += key;
        display_transfer_pin(amount, pin);
      }
    }
    // tambah amount untuk if transfer
    else if (last_key == '2' && !pin_mode)
    {
      if (key == '*' && amount != "")
      {
        amount = "";
        display_transfer(amount);
      }
      else if (key == '*' && amount == "")
      {
        last_key = '\0';
        display_help();
      }
      else if (key == '#')
      {
        pin_mode = true;
        display_transfer_pin(amount, pin);
      }
      else
      {
        amount += key;
        display_transfer(amount);
      }
    }
  }
}