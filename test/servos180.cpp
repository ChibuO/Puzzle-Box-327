#include "servos.h"

Servo myservo;

int pos = 0;
int servoPin = 27;
int quarter = 45;
int knob_ADC_max = 4000;
bool final_knob_turned = false;

void servo_setup()
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
    delay(15);
}

void setServoPos(int pos) {
    if (pos < 0) {
        pos = 0;
    } else if (pos > 180) {
        pos = 180;
    }
    myservo.write(pos);
    delay(15);
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
    myservo.write(180);
    delay(1000);
    myservo.write(0);

    // int steps = 18;
    // myservo.write(90);
    // delay(200);
    // for (int j = 1; j < steps; j++)
    // {
    //     myservo.write(90 + j * (90 / steps));
    //     delay(30);
    // }
}

void rotateQuarterLoop() {
    int servoPos = myservo.read();
    // Serial.println(String(servoPos));
    if (servoPos + quarter >= 180) {
        servo_reset();
    } else {
        myservo.write(servoPos + quarter);
        delay(15);
    }
}

void rotateQuarter() {
    int servoPos = myservo.read();
    if (servoPos + quarter < 180) {
        myservo.write(servoPos + quarter);
        delay(15);
    }
}

void rotateFromKnob(uint16_t knobInput, int mapMin, int mapMax) {
    if (knobInput > knob_ADC_max) {
        return;
    }
    int val = map(knobInput, 0, knob_ADC_max, mapMin, mapMax);
    // String h = "in: " + String(knobInput) + " out: " + String(val);
    // Serial.println(h);
    if (val < 180) {
        myservo.write(val);
    }
}

bool finalRotation(uint16_t knobInput) {
    if (knobInput > 3600) {
        final_knob_turned = true;
        return true;
    }
    rotateFromKnob(knobInput, 3*quarter, 180);
    return false;
}

int readServo() {
    return myservo.read();
}

bool isServoOpen() {
    return myservo.read() >= 180;
}

void openCompletely() {
    myservo.write(180);
}

void closeCompletely() {
    myservo.write(0);
}