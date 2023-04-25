#include <Arduino.h>
#include "opening.h"
#include "password.h"
#include "light_knobs.h"


const byte led_gpio = 32;


void setup() {
  Serial.begin(9600);
  pinMode(led_gpio, OUTPUT);
  keypad_setup();
  light_knobs_setup();
}

void loop() {
  update_led_status();

  if (led_is_correct()) {
    digitalWrite(led_gpio, HIGH);   // turn the LED on (HIGH is the voltage level)
  } else {
    digitalWrite(led_gpio, LOW);    // turn the LED off by making the voltage LOW
  }
  print_led_status();
  delay(300);

  /*
  //code for keypad
  char password[6] = {'1', '2', '3', '3', '#', '*'};
  Serial.write("starting\n");
  int done = keypad_password(6, password);
  Serial.write("done\n");

  digitalWrite(led_gpio, HIGH);
  */
}