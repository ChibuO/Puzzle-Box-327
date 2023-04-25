#ifndef PASSWORD_H
#define PASSWORD_H
    #include <Arduino.h>
    #include <Keypad.h>

    void keypad_setup();
    void read_keypad();
    char keypad_check_password(int n, char* code);
#endif /* PASSWORD_H */