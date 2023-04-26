#include <Arduino.h>
#include "opening.h"
#include "password.h"
#include "light_knobs.h"
#include "server.h"
#include "filesystem.h"

const byte led_gpio = 32;
const byte led_gpio2 = 33;
bool lights_done = 0;
bool keypad_done = 0;

char password[6] = {'1', '2', '3', '3', '#', '*'};

void setup()
{
  Serial.begin(9600);
  pinMode(led_gpio, OUTPUT);
  pinMode(led_gpio2, OUTPUT);
  keypad_setup();
  light_knobs_setup();
}

void loop()
{

  // lights puzzle
  while (!lights_done)
  {
    update_led_status();

    if (led_is_correct())
    {
      digitalWrite(led_gpio, HIGH); // turn the LED on (HIGH is the voltage level)
      lights_done = 1;
    }
    else
    {
      digitalWrite(led_gpio, LOW); // turn the LED off by making the voltage LOW
    }
    print_led_status();
    delay(300);
  }

  // code for keypad
  while (!keypad_done)
  {
    keypad_done = keypad_check_password(6, password);
    digitalWrite(led_gpio2, HIGH);
  }
  Serial.write("******************************\n");
  Serial.write("YOU WIN\n");
  Serial.write("******************************\n");

  while(1) {}
}