#ifndef IMU_H
#define IMU_H
    #include <Arduino.h>
    #include <Adafruit_MPU6050.h>
    #include <Adafruit_Sensor.h>
    #include <Wire.h>

    void imu_setup();
    String read_imu();

#endif /* IMU_H */