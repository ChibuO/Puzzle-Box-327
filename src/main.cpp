#include <Arduino.h>
#include "opening.h"
#include "password.h"
#include "light_knobs.h"
#include "server.h"
#include "filesystem.h"
#include "imu.h"

const byte led_gpio = 32;
const byte led_gpio2 = 33;
bool lights_done = 0;
bool keypad_done = 0;
bool door_open = 0;

char password[6] = {'1', '2', '3', '3', '#', '*'};

void setup()
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(led_gpio, OUTPUT);
  pinMode(led_gpio2, OUTPUT);
  keypad_setup();
  //light_knobs_setup();
  open_setup();
  imu_setup();

  // Initialize SPIFFS - for saving data in flash memory
  uint8_t spiffs_check = startSPIFFS();
  if (spiffs_check == 1) {
    Serial.println("SPIFFS ERROR!");
    return;
  }

  start_web_services();

}

void puzzle() {
  // lights puzzle
  while (!lights_done)
  {
    update_led_status();

    if (led_is_correct())
    {
      digitalWrite(led_gpio, HIGH); // turn the LED on (HIGH is the voltage level)
      lights_done = 1;
    }
    else
    {
      digitalWrite(led_gpio, LOW); // turn the LED off by making the voltage LOW
    }
    print_led_status();
    delay(300);
  }

  // code for keypad
  while (!keypad_done)
  {
    keypad_done = keypad_check_password(6, password);
    digitalWrite(led_gpio2, HIGH);
  }
  Serial.write("******************************\n");
  Serial.write("YOU WIN\n");
  Serial.write("******************************\n");

  while(1) {}
}

void motor() {
  open();
}

void send_to_socket(String msg) {
  ws.broadcastTXT(msg);
}

//bool show_words = is_websocket_connected;

void ltoop()
{
  digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  
  

  delay(100);
}


void loop()
{
  digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  if (!is_maze_completed) {
    String imu_data = read_imu();
    send_to_socket(imu_data);

    if (is_websocket_connected) {
      Serial.println(imu_data);
    }
  } else {
    Serial.println("buzzzzzzzzzzzzz");
    //if (!door_open)
    open();
    while (1) {}
  }
  

  delay(100);
}