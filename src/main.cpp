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
bool is_ldr_halfway_complete = false;
bool is_ldr_complete = false;
bool is_neos_complete = false;
bool puzzle_box_complete = false;

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  // pinMode(led_gpio, OUTPUT);
  // pinMode(led_gpio2, OUTPUT);
  oled_setup();
  keypad_setup();
  light_knobs_setup();
  servo_setup();
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

  servo_stop();

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
  String dText = "P" + String(current_puzzle+1);
  displayText(dText, 0, 3, 2);
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
    delay(300);
  }

  // pull out from puzzle_complete() bc we
  // need to wait for box to open
  Serial.println("!!!! " + String(current_puzzle));
  current_puzzle++; // 2
  rotateQuarter();
  send_to_socket(current_puzzle, "");

  //neo
  String color_solution_str = String(color_order[0]) + " " + String(color_order[1]) + " " + String(color_order[2]) + " " + String(color_order[3]);
  String color_solution_str2 = String(color_order[4]) + " " + String(color_order[5]) + " " + String(color_order[6]) + " " + String(color_order[7]);
  Serial.println(color_solution_str);
  Serial.println(color_solution_str2);
  // int freqs_password[7];
  // getFreqs(freqs_password);
  while (!is_neos_complete && !getPressedWithColor(8, color_order) && !should_skip_puzzle) {
    delay(100);
  }
  is_neos_complete = true;
  
  puzzle_complete(); // -> 3
  rotateQuarter();

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

  puzzle_complete(); // -> 4
  rotateQuarter();
  
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

  puzzle_complete(); // -> 5

  //dark/light
  //get numbers to send for dark/light
  send_to_socket(current_puzzle, light_dark_str);

  while (!is_ldr_halfway_complete && !light_ldr_correct(light_ldr) && !should_skip_puzzle) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }
  is_ldr_halfway_complete = true;

  send_to_socket(current_puzzle, "halfway");

  while (!is_ldr_complete && !dark_ldr_correct(light_ldr, dark_ldr) && !should_skip_puzzle) {
    update_ldr_status(1);
    print_ldr_status();
    delay(300);
  }
  is_ldr_complete = true;

  send_to_socket(current_puzzle, "continue");

  // in case ldr was skipped
  if (should_skip_puzzle) {
    should_skip_puzzle = false;
  }

  update_led_status_raw(); // so it doesn't start at 0
  while(!are_knobs_off()) {
    update_led_status_raw();
    displayText("Lights Out", 0, 3, 2);
    Serial.println("waiting");
    delay(300);
  }

  puzzle_complete(); // -> 6

  //tilt
  unsigned long lastIMUReadTime = 0;
  unsigned long lastKeypadReadTime = 0;
  calculate_IMU_error(); //wait 5 seconds and calibrate
  while (!is_dial_completed && !should_skip_puzzle) {
    unsigned long currentTime = millis();

    // Read keypad every 100ms
    if (currentTime - lastKeypadReadTime >= 100) {
      // read_keypad_keys(code); // until fixed
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

  Serial.println("tilt done");
  puzzle_complete(); // 7

  //knob
  while(!final_knob_turned && !should_skip_puzzle) {
    if (is_correct_knob_turned(which_knob)) {
      finalRotation(readKnob(which_knob));
    }
    update_led_status_raw();
    read_potentiometers();
    delay(200);
  }

  Serial.println("turn done");
  puzzle_complete();

  Serial.println("box complete");
  displayText("COMPLETE", 0, 3, 2);
  send_to_socket(current_puzzle, "");
  puzzle_box_complete = true;
}


void loop() {
  //todo: check for box down

  if (should_start_puzzles && !puzzle_box_complete) {
    Serial.println("lego");
    calculate_IMU_error(); //wait 5 seconds and calibrate

    //then start
    start_puzzles();
  }

  Serial.println("my eggo");
  delay(5000);
}

void setu9p() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  // pinMode(led_gpio, OUTPUT);
  // pinMode(led_gpio2, OUTPUT);
  // keypad_setup();
  // light_knobs_setup();
  servo_setup();
  // servo_reset();
  // setServoPos(135);
  // imu_setup();
  // neopixel_setup();
  // photosensors_setup();
  // weight_setup();
  // oled_setup();
}

void loo8p() {
  // Serial.println("starting loop");
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
  // oled_loop();
  // open();
  // delay(2000);
  // which_knob = 2;
  // while(!final_knob_turned && !should_skip_puzzle) {
  //   if (is_correct_knob_turned(which_knob) && !finalRotation(readKnob(which_knob))) {
  //     Serial.println("turn");
  //   }
  //   update_led_status_raw();
  //   read_potentiometers();
  //   delay(200);
  // }
  // Serial.println("done");
  // delay(5000);
  servo_loop();
  // find_quarter_loop();
}
