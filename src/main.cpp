#include "main.h"

// const byte led_gpio = 32;
// const byte led_gpio2 = 33;
bool lights_done = 0;
bool keypad_done = 0;
bool neos_done = 0;
bool door_open = 0;
int current_puzzle = 1; //website starts at zero

char example_password[6] = {'1', '2', '3', '3', '#', '*'};

int light_ldr, dark_ldr;
String light_dark_str;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  // pinMode(led_gpio, OUTPUT);
  // pinMode(led_gpio2, OUTPUT);
  oled_setup();
  keypad_setup();
  light_knobs_setup();
  open_setup();
  neopixel_setup();
  photosensors_setup();
  weight_setup();
  imu_setup();

  // Initialize SPIFFS - for saving data in flash memory
  uint8_t spiffs_check = startSPIFFS();
  if (spiffs_check == 1) {
    Serial.println("SPIFFS ERROR!");
    return;
  }

  start_web_services();

  // servo_reset();

  light_ldr = getRandInt(0, 2);
  dark_ldr = getRandInt(0, 2);
  while(light_ldr == dark_ldr) {
    dark_ldr = getRandInt(0, 2);
  }
  light_dark_str = String(light_ldr) + "" + String(dark_ldr);
  Serial.print("ld: ");
  Serial.println(light_dark_str);
}

void puzzle_complete() {
  if(should_skip_puzzle) {
    send_to_socket(current_puzzle, "skipped");
    Serial.println(">>>> " + String(current_puzzle));
  }
  uint32_t green_color = rgb_to_binary(0, 255, 0);
  uint32_t clear_color = rgb_to_binary(0, 0, 0);
  colorWipe(green_color, 100);
  colorWipe(clear_color, 50);
  if(!should_skip_puzzle) {
    send_to_socket(current_puzzle, "completed");
    Serial.println("!!!! " + String(current_puzzle));
  }
  current_puzzle++;
  should_skip_puzzle = false;
  send_to_socket(current_puzzle, "");
}

void start_puzzles() {
  //maze puzzle
  while(!is_maze_completed) {
    if(recal_accelerometer) {
      calculate_IMU_error();
      recal_accelerometer = false;
    }
    String imu_data = read_imu();
    send_to_socket(current_puzzle, imu_data);
    delay(100);
  }

  // pull out from puzzle_complete() bc 
  // need to wait for box to open
  Serial.println("!!!! " + String(current_puzzle));
  current_puzzle++; // 2
  while (!open()) {};
  send_to_socket(current_puzzle, "");

  //neo
  String color_solution_str = String(color_order[0]) + " " + String(color_order[1]) + " " + String(color_order[2]) + " " + String(color_order[3]);
  String color_solution_str2 = String(color_order[4]) + " " + String(color_order[5]) + " " + String(color_order[6]) + " " + String(color_order[7]);
  Serial.println(color_solution_str);
  Serial.println(color_solution_str2);
  // int freqs_password[7];
  // getFreqs(freqs_password);
  while (!getPressedWithColor(8, color_order) && !should_skip_puzzle) {
    delay(100);
  }
  
  puzzle_complete(); // 3

  // knobs puzzle
  while (!start_lights || should_skip_puzzle)
  {
    Serial.println("waiting for lights");
    delay(500);
  }

  int sequence[3] = {};
  get_sequence(sequence, light_order);
  String light_solution_str = String(sequence[0]) + " " + String(sequence[1]) + " " + String(sequence[2]);
  Serial.println(light_solution_str);
  
  while (!lights_done && !should_skip_puzzle) {
    update_led_status();

    if (led_is_correct(sequence)) {
      lights_done = 1;
    }

    // print_led_status();
    delay(300);
  }

  puzzle_complete();
  
  //weight
  while(!is_weights_complete && !should_skip_puzzle) {
    if(recal_scale) {
      calibrate_loop();
      recal_scale = false;
    }
    long weight = get_weight();
    send_to_socket(current_puzzle, (String) weight);
    // Serial.println(weight);
    delay(300);
  }

  puzzle_complete();

  //dark/light
  //get numbers to send for dark/light
  send_to_socket(current_puzzle, light_dark_str);

  while (!light_ldr_correct(light_ldr) && !should_skip_puzzle) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }

  send_to_socket(current_puzzle, "halfway");

  while (!dark_ldr_correct(light_ldr, dark_ldr) && !should_skip_puzzle) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }

  send_to_socket(current_puzzle, "continue");

  while(!are_knobs_off()) {
    update_led_status();
    delay(300);
  }

  puzzle_complete();

  //tilt
  unsigned long lastIMUReadTime = 0;
  unsigned long lastKeypadReadTime = 0;
  calculate_IMU_error(); //wait 5 seconds and calibrate
  while (!is_dial_completed && !should_skip_puzzle) {
    unsigned long currentTime = millis();

    // Read keypad every 100ms
    if (currentTime - lastKeypadReadTime >= 100) {
      read_keypad_keys(code);
      lastKeypadReadTime = currentTime;
    }

    if(recal_accelerometer) {
      calculate_IMU_error();
      recal_accelerometer = false;
    }
    
    // send every 300 ms
    if (currentTime - lastIMUReadTime >= 300) {
      String imu_data = read_imu();
      // Serial.println(imu_data);
      send_to_socket(current_puzzle, imu_data);
      lastIMUReadTime = currentTime;
    }

    delay(100);
  }

  puzzle_complete();

  //knob
  while(!is_knob_turned(which_knob) && !should_skip_puzzle) {
    update_led_status();
    delay(300);
  }

  puzzle_complete();

  Serial.println("box complete");
  send_to_socket(current_puzzle, "");
  while(1) {}
}


void loop() {
  // digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));

  //todo: check for box down

  if (should_start_puzzles) {
    Serial.println("lego");
    delay(5000);
    calculate_IMU_error(); //wait 5 seconds and calibrate

    //then start
    start_puzzles();
  }

  delay(100);
}

void se3tup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  // pinMode(led_gpio, OUTPUT);
  // pinMode(led_gpio2, OUTPUT);
  // keypad_setup();
  // light_knobs_setup();
  // open_setup();
  // imu_setup();
  // neopixel_setup();
  // photosensors_setup();
  // weight_setup();
  oled_setup();
}

void lo3op() {
  // if(recal_scale) {
    // calibrate_loop();
    // recal_scale = false;
  // }
  // print_weight();
  // weight_loop();
  // delay(100);
  // neos_main();
  // read_potentiometers();
  // char order[4] = {'3', '6', '9', '1'};
  // while (!getPressedWithColor(4, order)) {
  //   delay(100);
  // }
  // char order[6] = {'2', '3', '1', '5', '5', '7'};
  // read_keypad_keys(order);
  // delay(100);
  // delay(300);
  oled_loop();
}
