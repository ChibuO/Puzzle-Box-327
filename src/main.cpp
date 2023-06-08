#include "main.h"

const byte led_gpio = 32;
const byte led_gpio2 = 33;
bool lights_done = 0;
bool keypad_done = 0;
bool door_open = 0;
int current_puzzle = 1;

char password[6] = {'1', '2', '3', '3', '#', '*'};
int sequence[3] = {};

int light_ldr, dark_ldr;
String light_dark_str;


int randInt(int lower, int upper) {
    // int i;
    // for (i = 0; i < count; i++) {
    //     int num = (rand() %
    //     (upper - lower + 1)) + lower;
    // }
    int num = (rand() % (upper - lower + 1)) + lower;
    return num;
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  // pinMode(led_gpio, OUTPUT);
  // pinMode(led_gpio2, OUTPUT);
  // keypad_setup();
  // light_knobs_setup();
  // open_setup();
  // imu_setup();
  neopixel_setup();
  // photosensors_setup();
  // weight_setup();

  // Initialize SPIFFS - for saving data in flash memory
  // uint8_t spiffs_check = startSPIFFS();
  // if (spiffs_check == 1) {
  //   Serial.println("SPIFFS ERROR!");
  //   return;
  // }

  // start_web_services();

  // servo_reset();

  light_ldr = randInt(0, 2);
  dark_ldr = randInt(0, 2);
  while(light_ldr == dark_ldr) {
    dark_ldr = randInt(0, 2);
  }
  light_dark_str = String(light_ldr) + "" + String(dark_ldr);
  Serial.print("ld: ");
  Serial.println(light_dark_str);
}

void send_to_socket(String data) {
  String json = "{\"completed\":\"";
  json += (String) current_puzzle;
  json += "\",\"data\":\"";
  json += data;
  json += "\"}";
  ws.broadcastTXT(json);
}

void puzzle_complete() {
  Serial.println("!!!! " + String(current_puzzle));
  current_puzzle++;
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
  // String out_str = String(sequence[0]) + " " + String(sequence[1]) + " " + String(sequence[2]) + " " + String(sequence[3]);
  String out_str = String(sequence[0]) + " " + String(sequence[1]) + " " + String(sequence[2]);
  Serial.println(out_str);
  while (!lights_done) {
    update_led_status();

    if (led_is_correct(sequence)) {
      // digitalWrite(led_gpio, HIGH); // turn the LED on (HIGH is the voltage level)
      lights_done = 1;
    // } else {
    //   digitalWrite(led_gpio, LOW); // turn the LED off by making the voltage LOW
    }

    print_led_status();
    delay(300);
  }

  puzzle_complete();
  
  //weight
  // code for keypad
  while (!keypad_done) {
    keypad_done = neos_plus_keypad(400);
    // digitalWrite(led_gpio2, HIGH);
  }

  puzzle_complete();

  //tilt
  if (!is_dial_completed) {
    String imu_data = read_imu();
    send_to_socket(imu_data);
  }
  puzzle_complete();

  delay(3000);

  //dark/light
  //get numbers to send for dark/light

  send_to_socket(light_dark_str);

  while (!light_ldr_correct(light_ldr)) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }

  send_to_socket("halfway");

  while (!dark_ldr_correct(light_ldr, dark_ldr)) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }

  send_to_socket("continue");

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
  send_to_socket("");
  while(1) {}
}


void loo9p() {
  digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  //check for box down
  if (!is_maze_completed) {
    String imu_data = read_imu();
    send_to_socket(imu_data);
  } else {
    //check for box down
    Serial.println("!!!! " + String(current_puzzle));
    current_puzzle++;
    while (!open()) {};
    send_to_socket("");

    puzzle();
    // puzzle_complete();
  }
  

  delay(100);
}

void loop() {
  // print_weight();
  // delay(1000);
  while (!keypad_done) {
    keypad_done = neos_plus_keypad(400);
    // digitalWrite(led_gpio2, HIGH);
  }
}
