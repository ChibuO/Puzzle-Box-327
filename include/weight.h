#ifndef WEIGHT_H
#define WEIGHT_H
    #include <Arduino.h>
    #include "HX711.h"
    #include "soc/rtc.h"

    void weight_setup();
    long get_weight();
    void print_weight();
    void calibrate_setup();
    void calibrate_loop();
    void weight_loop();
    

#endif /* WEIGHT_H */