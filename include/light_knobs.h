#ifndef LIGHT_KNOBS_H
#define LIGHT_KNOBS_H
    #include <Arduino.h>

    void light_knobs_setup();
    int get_status(uint16_t ar);
    void update_led_status();
    bool led_is_correct();
    void print_led_status();

#endif /* LIGHT_KNOBS_H */