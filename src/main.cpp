#include "main.h"

const byte led_gpio = 32;
const byte led_gpio2 = 33;
bool lights_done = 0;
bool keypad_done = 0;
bool neos_done = 0;
bool door_open = 0;
int current_puzzle = 1; //website starts at zero

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
  pinMode(led_gpio, OUTPUT);
  pinMode(led_gpio2, OUTPUT);
  keypad_setup();
  light_knobs_setup();
  open_setup();
  imu_setup();
  neopixel_setup();
  photosensors_setup();
  weight_setup();

  // Initialize SPIFFS - for saving data in flash memory
  uint8_t spiffs_check = startSPIFFS();
  if (spiffs_check == 1) {
    Serial.println("SPIFFS ERROR!");
    return;
  }

  start_web_services();

  servo_reset();

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
  should_skip_puzzle = false;
  send_to_socket("completed");
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

  // if(!should_skip_puzzle) {
  //   send_to_socket("completed");
  // }
}


void start_puzzles() {
  //maze puzzle
  while(!is_maze_completed) {
    String imu_data = read_imu();
    send_to_socket(imu_data);
    delay(100);
  }

  Serial.println("!!!! " + String(current_puzzle));
  current_puzzle++;
  while (!open()) {};
  send_to_socket("");

  // lights puzzle
  get_sequence(sequence, light_order);
  // String out_str = String(sequence[0]) + " " + String(sequence[1]) + " " + String(sequence[2]) + " " + String(sequence[3]);
  String light_solution_str = String(sequence[0]) + " " + String(sequence[1]) + " " + String(sequence[2]);
  Serial.println(light_solution_str);
  
  while (!lights_done && !should_skip_puzzle) {
    update_led_status();

    if (led_is_correct(sequence)) {
      lights_done = 1;
    }

    print_led_status();
    delay(300);
  }

  puzzle_complete();
  Serial.println("first");
  
  //weight
  // code for keypad
  while (!keypad_done && !should_skip_puzzle) {
    // Serial.println("2nd");
    // keypad_done = keypad_check_password(6, password);
    Serial.println("keypad");
  }

  Serial.println("done");
  puzzle_complete();

  //tilt
  if (!is_dial_completed && !should_skip_puzzle) {
    String imu_data = read_imu();
    send_to_socket(imu_data);
  }

  puzzle_complete();

  //dark/light
  //get numbers to send for dark/light
  send_to_socket(light_dark_str);

  while (!light_ldr_correct(light_ldr) && !should_skip_puzzle) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }

  send_to_socket("halfway");

  while (!dark_ldr_correct(light_ldr, dark_ldr) && !should_skip_puzzle) {
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

  //neo
  while (!neos_done && !should_skip_puzzle) {
    neos_done = neos_plus_keypad(400);
  }
  
  puzzle_complete();

  delay(3000);

  //knob
  puzzle_complete();

  Serial.println("box complete");
  send_to_socket("");
  while(1) {}
}


void loop() {
  digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  //todo: check for box down

  if (should_start_puzzles) {
    Serial.println("lego");
    delay(5000);
    calculate_IMU_error(); //wait 5 seconds and calibrate

    //then start
    start_puzzles();
  }
  


  // if (!is_maze_completed) {
  //   String imu_data = read_imu();
  //   send_to_socket(imu_data);
  // } else {
  //   //todo: check for box down
  //   Serial.println("!!!! " + String(current_puzzle));
  //   current_puzzle++;
  //   while (!open()) {};
  //   send_to_socket("");

  //   puzzle();
  // }
  

  delay(100);
}

void lo6op() {
  // print_weight();
  // delay(1000);
  while (!keypad_done) {
    keypad_done = neos_plus_keypad(400);
    // digitalWrite(led_gpio2, HIGH);
  }
}
