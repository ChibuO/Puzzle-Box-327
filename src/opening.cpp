#include "opening.h"

Servo myservo;

int pos = 0;
int servoPin = 13; // GPIO 13 controls the motor

void open_setup()
{
    // Allow allocation of all timers
    ESP32PWM::allocateTimer(0);
    ESP32PWM::allocateTimer(1);
    ESP32PWM::allocateTimer(2);
    ESP32PWM::allocateTimer(3);
    myservo.setPeriodHertz(50);          // standard 50 hz servo
    myservo.attach(servoPin, 500, 2400); // attaches the servo on pin 18 to the servo object
                                         // using default min/max of 1000us and 2000us
                                         // different servos may require different min/max settings
                                         // for an accurate 0 to 180 sweep
}

void servo_reset() {
    myservo.write(0);
    delay(1000);
}

bool open() {
    // myservo.write(0);
    // delay(1000);
    // myservo.write(75);
    // delay(1000);

    int steps = 75;
    // myservo.write(90);
    // delay(200);
    for (int j = 1; j < steps; j++)
    {
        myservo.write(j);
        delay(30);
    }

    return true;
}

void close()
{
    myservo.write(75);
    delay(1000);
    myservo.write(0);

    int steps = 18;
    // myservo.write(90);
    // delay(200);
    for (int j = 1; j < steps; j++)
    {
        myservo.write(90 + j * (90 / steps));
        delay(30);
    }
}