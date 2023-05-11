#include <Arduino.h>
#include "opening.h"
#include "password.h"
#include "light_knobs.h"
#include "server.h"
#include "filesystem.h"
#include "imu.h"

const byte led_gpio = 32;
const byte led_gpio2 = 33;
bool lights_done = 1;
bool keypad_done = 0;
bool door_open = 0;
int num_completed = 0;

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

  reset();
}

void send_to_socket(String data) {
  String json = "{\"completed\":\"";
  json += (String) num_completed;
  json += "\",\"data\":\"";
  json += data;
  json += "\"}";
  ws.broadcastTXT(json);
}

void puzzle() {
  // lights puzzle
  while (!lights_done) {
    update_led_status();

    if (led_is_correct()) {
      digitalWrite(led_gpio, HIGH); // turn the LED on (HIGH is the voltage level)
      lights_done = 1;
    } else {
      digitalWrite(led_gpio, LOW); // turn the LED off by making the voltage LOW
    }

    print_led_status();
    delay(300);
  }

  num_completed++;
  
  //weight
  num_completed++;

  send_to_socket("");

  // code for keypad
  while (!keypad_done) {
    keypad_done = keypad_check_password(6, password);
    digitalWrite(led_gpio2, HIGH);
    send_to_socket("");
  }

  Serial.write("******************************\r\n");
  Serial.write("YOU WIN\r\n");
  Serial.write("******************************\r\n");

  num_completed++;

  while(1) {
    send_to_socket("");
  }
}


void loop()
{
  digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  if (!is_maze_completed) {
    String imu_data = read_imu();
    send_to_socket(imu_data);

    // if (is_websocket_connected) {
    //   // Serial.println(imu_data);
    //   //Serial.println(json.c_str());
    // }
  } else {
    Serial.println("buzzzzzzzzzzzzz");
    //if (!door_open)
    num_completed++;
    while (!open()) {
      send_to_socket("");
    };
    puzzle();
  }
  

  delay(100);
}