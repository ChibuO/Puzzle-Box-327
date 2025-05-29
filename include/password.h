#ifndef PASSWORD_H
#define PASSWORD_H
    #include <Arduino.h>
    #include <Keypad.h>
    #include "neos.h"
    #include "utilities.h"

    void keypad_setup();
    void read_keypad();
    void read_keypad_keys(char *shape_code);
    bool is_getKeys();
    Key getKeypadKey(int i);
    int getPressedWithColor(int n, char *passcode);
#endif /* PASSWORD_H */