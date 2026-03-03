#include "light_knobs.h"

const byte POT_PIN1 = 34;
const byte POT_PIN2 = 39;
const byte POT_PIN3 = 36;

int led_status[] = {def_light, def_light, def_light};
int led_status_raw[] = {0, 0, 0};
// bool final_knob_turned = false;

void get_sequence(int seq[], char light_string[]) {
  for(int i = 0; i < 3; i++) {
    switch (light_string[i]) {
    case '0':
      seq[i] = noon;
      break;
    case '1':
      seq[i] = dawn;
      break;
    case '2':
      seq[i] = gloaming;
      break;
    case '3':
      seq[i] = midnight;
      break;
    default:
      seq[i] = midnight;
    }
  }

}

void light_knobs_setup() {
    pinMode(POT_PIN1, INPUT);
    pinMode(POT_PIN2, INPUT);
    pinMode(POT_PIN3, INPUT);
}

int get_led_status(uint16_t ar) {
  if (ar < midnight) {
    return midnight;
  } else if (ar > midnight && ar < gloaming) {
    return gloaming;
  } else if (ar > gloaming && ar < dawn) {
    return dawn;
  } else {
    return noon;
  }
}

void update_led_status() {
    led_status[0] = get_led_status(analogRead(POT_PIN1));
    led_status[1] = get_led_status(analogRead(POT_PIN2));
    led_status[2] = get_led_status(analogRead(POT_PIN3));
}

void update_led_status_raw() {
  led_status_raw[0] = analogRead(POT_PIN1);
  led_status_raw[1] = analogRead(POT_PIN2);
  led_status_raw[2] = analogRead(POT_PIN3);
}

uint16_t readKnob(int knobNum) {
  switch (knobNum)
  {
  case 1:
    return analogRead(POT_PIN1);
    break;
  case 2:
    return analogRead(POT_PIN2);
    break;
  case 3:
    return analogRead(POT_PIN3);
    break;
  default:
    return 0;
    break;
  }
}

bool led_is_correct(int sequence[]) {
  return led_status[0] == sequence[0] && led_status[1] == sequence[1] && led_status[2] == sequence[2];
}

bool are_knobs_off() {
  int threshold = 10;
  return led_status_raw[0] < threshold && led_status_raw[1] < threshold && led_status_raw[2] < threshold;
}

bool is_correct_knob_turned(int num) {
  bool is_correct = true;
  // only the correct knob should be turned
  // the others should stay zero
  for (int i = 0; i < 3; i++) {
    if (i+1 == num) {
      is_correct = is_correct && led_status_raw[i] > 0;
    } else {
      is_correct = is_correct && led_status_raw[i] <= 500;
    }
  }
  return is_correct;
}

void check_knob_turned(int knobNum) {
  if(led_status_raw[knobNum-1] > 3600) {
    // final_knob_turned = true;
    Serial.println("yes");
  }
}

void print_led_status() {
    String out_str = String(led_status[0]) + " " + String(led_status[1]) + " " + String(led_status[2]);
    Serial.println(out_str);
}

void read_potentiometers() {
  String out_str = String(analogRead(POT_PIN1)) + " " + String(analogRead(POT_PIN2)) + " " + String(analogRead(POT_PIN3));
  Serial.println(out_str);
}

