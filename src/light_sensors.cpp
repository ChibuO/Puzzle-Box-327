#include "light_sensors.h"

const byte LDR_PIN1 = 35;
const byte LDR_PIN2 = 32;
const byte LDR_PIN3 = 33;
const byte LDR_PIN4 = 15;

int ldr_status[] = {normal, normal, normal};

void photosensors_setup() {
    pinMode(LDR_PIN1, INPUT);
    pinMode(LDR_PIN2, INPUT);
    pinMode(LDR_PIN3, INPUT);
    // pinMode(LDR_PIN4, INPUT);
}

int get_ldr_status(uint16_t ar) {
  if (ar <= dark) {
    return dark;
  } else if (ar >= light) {
    return light;
  } else {
    return normal;
  }
}

void update_ldr_status(int r) {
    if (r == 1) {
        ldr_status[0] = get_ldr_status(analogRead(LDR_PIN1));
        ldr_status[1] = get_ldr_status(analogRead(LDR_PIN2));
        ldr_status[2] = get_ldr_status(analogRead(LDR_PIN3));
        // ldr_status[3] = get_ldr_status(analogRead(LDR_PIN4));
    } else {
        ldr_status[0] = analogRead(LDR_PIN1);
        ldr_status[1] = analogRead(LDR_PIN2);
        ldr_status[2] = analogRead(LDR_PIN3);
        // ldr_status[3] = analogRead(LDR_PIN4);
    }
}

void print_ldr_status() {
    // String out_str = String(ldr_status[0]) + " " + String(ldr_status[1]) + " " + String(ldr_status[2]) + " " + String(ldr_status[3]);
    String out_str = String(ldr_status[0]) + " " + String(ldr_status[1]) + " " + String(ldr_status[2]);
    Serial.println(out_str);
}


bool light_ldr_correct(int light_ldr) {
    if(light_ldr > 2) return false;

    bool result = true;
    for(int i = 0; i < 3; i++) {
        if(i == light_ldr) {
            result &= (ldr_status[i] == light);
        } else {
            result &= (ldr_status[i] == normal);
        }
    }
    return result;
}

bool dark_ldr_correct(int light_ldr, int dark_ldr) {
    if(light_ldr > 2 || dark_ldr > 2) return false;

    bool result = true;
    for(int i = 0; i < 3; i++) {
        if(i == light_ldr) {
            result &= (ldr_status[i] == light);
        } else if(i == dark_ldr) {
            result &= (ldr_status[i] == dark);
        } else {
            result &= (ldr_status[i] == normal);
        }
    }
    return result;
}

void ldr_main() {
    update_ldr_status(1);

    // Serial.print(light_ldr_correct(3));
    // Serial.print(" ");

    // while (!dark_ldr_correct(0, 2)) {
    //     update_ldr_status(1);
        print_ldr_status();
        delay(300);
    // }
}

