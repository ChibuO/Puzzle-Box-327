#include <Arduino.h>
#include "opening.h"

const byte POT_PIN1 = 36;
const byte POT_PIN2 = 39;
const byte POT_PIN3 = 34;
const byte POT_PIN4 = 35;
const byte led_gpio = 32;

#define midnight 1860
#define dawn 2320
#define twilight 2480
#define noon 3690

int sequence[] = {dawn, noon, midnight, twilight};
int led_status[] = {midnight, midnight, midnight, midnight};

void setup() {
  Serial.begin(9600);
  pinMode(led_gpio, OUTPUT);
}

int get_status(uint16_t ar) {
  if (ar < midnight) {
    return midnight;
  } else if (ar > midnight && ar < dawn) {
    return dawn;
  } else if (ar > dawn && ar < twilight) {
    return twilight;
  } else {
    return noon;
  }
}

void loop() {
  led_status[0] = get_status(analogRead(POT_PIN1));
  led_status[1] = get_status(analogRead(POT_PIN2));
  led_status[2] = get_status(analogRead(POT_PIN3));
  led_status[3] = get_status(analogRead(POT_PIN4));

  // led_status[0] = analogRead(POT_PIN1);
  // led_status[1] = analogRead(POT_PIN2);
  // led_status[2] = analogRead(POT_PIN3);
  // led_status[3] = analogRead(POT_PIN4);

  bool is_correct = led_status[0] == sequence[0] && led_status[1] == sequence[1] && led_status[2] == sequence[2] && led_status[3] == sequence[3];

  if (is_correct) {
    digitalWrite(led_gpio, HIGH);   // turn the LED on (HIGH is the voltage level)
  } else {
    digitalWrite(led_gpio, LOW);    // turn the LED off by making the voltage LOW
  }

  String out_str = String(led_status[0]) + " " + String(led_status[1]) + " " + String(led_status[2]) + " " + String(led_status[3]);
  Serial.println(out_str);
  delay(500);
}