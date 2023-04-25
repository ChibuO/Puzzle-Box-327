#ifndef PASSWORD_H
#define OPASSWORD_H
    #include <Arduino.h>
    #include <ESP32Servo.h>
    #include <Keypad.h>

    void keypad_setup();
    void read_keypad();
    char keypad_password(int n, char* code);
#endif /* OPENING_H */