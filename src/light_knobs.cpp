#include "light_knobs.h"

const byte POT_PIN1 = 36;
const byte POT_PIN2 = 39;
const byte POT_PIN3 = 34;
const byte POT_PIN4 = 35;
const byte led_gpio = 32;

int led_status[] = {midnight, midnight, midnight, midnight};

void get_sequence(int seq[], char light_string[]) {
  for(int i = 0; i < 4; i++) {
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
    pinMode(POT_PIN4, INPUT);
}

int get_status(uint16_t ar) {
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
    led_status[0] = get_status(analogRead(POT_PIN1));
    led_status[1] = get_status(analogRead(POT_PIN2));
    led_status[2] = get_status(analogRead(POT_PIN3));
    led_status[3] = get_status(analogRead(POT_PIN4));
}

bool led_is_correct(int sequence[]) {
  return led_status[0] == sequence[0] && led_status[1] == sequence[1] && led_status[2] == sequence[2] && led_status[3] == sequence[3];
}

bool are_knobs_off() {
  return led_status[0] == midnight && led_status[1] == midnight && led_status[2] == midnight && led_status[3] == midnight;
}

void print_led_status() {
    String out_str = String(led_status[0]) + " " + String(led_status[1]) + " " + String(led_status[2]) + " " + String(led_status[3]);
    Serial.println(out_str);
}

