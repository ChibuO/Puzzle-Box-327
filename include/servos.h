#ifndef SERVOS_H
#define SERVOS_H
    #include <Arduino.h>
    #include <ESP32Servo.h>
    #include <cmath>

    void servo_setup();
    bool open();
    void close();
    void rotateQuarter();
    bool finalRotation(uint16_t knobInput);
    void servo_reset();
    void servo_stop();
    void servo_loop();
    void setServoPos(int pos);
    extern bool final_knob_turned;
#endif /* SERVOS_H */

