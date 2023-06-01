#include "main.h"

const byte led_gpio = 32;
const byte led_gpio2 = 33;
bool lights_done = 0;
bool keypad_done = 0;
bool door_open = 0;
int num_completed = 0;

char password[6] = {'1', '2', '3', '3', '#', '*'};
int sequence[4] = {};

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(led_gpio, OUTPUT);
  pinMode(led_gpio2, OUTPUT);
  keypad_setup();
  light_knobs_setup();
  open_setup();
  imu_setup();
  neopixel_setup();

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

void puzzle_complete() {
  Serial.println("!!!! " + String(num_completed));
  num_completed++;
  colorWipe(rgb_to_binary(  0, 255,   0), 100); // Green
  colorWipe(rgb_to_binary(  0, 0,   0), 50); // dark
  // delay(500);
  colorWipe(rgb_to_binary(  0, 255,   0), 100); // Green
  colorWipe(rgb_to_binary(  0, 0,   0), 50); // dark
  // delay(500);
  colorWipe(rgb_to_binary(  0, 255,   0), 100); // Green
  // delay(1500);
  colorWipe(rgb_to_binary(  0, 0,   0), 50); // dark
  send_to_socket("completed");
}


void puzzle() {
  // lights puzzle
  get_sequence(sequence, light_order);
  String out_str = String(sequence[0]) + " " + String(sequence[1]) + " " + String(sequence[2]) + " " + String(sequence[3]);
  Serial.println(out_str);
  while (!lights_done) {
    update_led_status();

    if (led_is_correct(sequence)) {
      digitalWrite(led_gpio, HIGH); // turn the LED on (HIGH is the voltage level)
      lights_done = 1;
    } else {
      digitalWrite(led_gpio, LOW); // turn the LED off by making the voltage LOW
    }

    print_led_status();
    delay(300);
  }

  puzzle_complete();
  
  //weight
  // code for keypad
  while (!keypad_done) {
    keypad_done = keypad_check_password(6, password);
    // digitalWrite(led_gpio2, HIGH);
  }

  // Serial.write("******************************\r\n");
  // Serial.write("YOU WIN\r\n");
  // Serial.write("******************************\r\n");
  puzzle_complete();

  delay(3000);

  //tilt
  puzzle_complete();

  delay(3000);

  //dark/light
  while(!are_knobs_off()) {
    update_led_status();
    delay(300);
  }
  puzzle_complete();

  delay(3000);

  //neo
  puzzle_complete();

  delay(3000);

  //knob
  puzzle_complete();

  Serial.println("box complete");
  while(1) {
    send_to_socket("");
  }
}


void loop() {
  digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  //check for box down
  if (!is_maze_completed) {
    String imu_data = read_imu();
    send_to_socket(imu_data);
  } else {
    //check for box down
    num_completed++;
    // while (!open()) {};
    send_to_socket("");

    puzzle();
    // puzzle_complete();
  }
  

  delay(100);
}