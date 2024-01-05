#ifndef LIGHT_SENSORS_H
#define LIGHT_SENSORS_H
    #include <Arduino.h>

    #define dark 140
    #define normal 200
    #define light 2000

    void photosensors_setup();
    void print_ldr_status();
    void update_ldr_status(int r);
    bool light_ldr_correct(int light_ldr);
    bool dark_ldr_correct(int light_ldr, int dark_ldr);

    void ldr_main();

#endif /* LIGHT_SENSORS_H */