#ifndef LIGHT_KNOBS_H
#define LIGHT_KNOBS_H
    #include <Arduino.h>

    #define midnight 1860
    #define gloaming 2320
    #define dawn 2480
    #define noon 3800

    void light_knobs_setup();
    int get_status(uint16_t ar);
    void update_led_status();
    bool led_is_correct(int sequence[]);
    void print_led_status();
    bool are_knobs_off();
    void get_sequence(int seq[], char light_string[]);

#endif /* LIGHT_KNOBS_H */