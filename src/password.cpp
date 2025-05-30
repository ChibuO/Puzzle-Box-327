#include <password.h>

const byte ROWS = 4; // four rows
const byte COLS = 3; // three columns

char keys[ROWS][COLS] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'*', '0', '#'}};
// byte rowPins[ROWS] = {17, 15, 2, 4}; // connect to the row pinouts of the kpd, orientation 1
// byte colPins[COLS] = {16, 5, 0};     // connect to the column pinouts of the kpd, orientation 1
byte rowPins[ROWS] = {2, 5, 17, 4}; // connect to the row pinouts of the kpd, orientation 2
byte colPins[COLS] = {0, 15, 16};     // connect to the column pinouts of the kpd, orientation 2

Keypad kpd = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

unsigned long loopCount;
unsigned long startTime;
String msg;
int pressed = 0;
int released = 0;
int n_temp = 0;
String text_to_display = "";

void keypad_setup()
{
    // Serial.begin(9600);
    loopCount = 0;
    startTime = millis();
    msg = "";
}

int getPressedWithColor(int n, char *passcode) {
    if (kpd.getKeys()) {
        for (int i = 0; i < LIST_MAX; i++) {
            if (kpd.key[i].stateChanged) {
                switch (kpd.key[i].kstate) { 
                    // Report active key state : IDLE, PRESSED, HOLD, or RELEASED
                    case PRESSED:
                        if (passcode[n_temp] == kpd.key[i].kchar) {
                            released = 0;
                            pressed = 1;
                        }
                        else {
                            released = 0;
                            pressed = 0;
                            n_temp = 0;
                        }
                        msg = " PRESSED";
                        if (true) {
                            char key_str[2] = "\0"; /* gives {\0, \0} */
                            key_str[0] = kpd.key[i].kchar;
                            showColorByNumber(kpd.key[i].kchar);
                        }
                        break;
                    case HOLD:
                        msg = " HOLD";
                        break;
                    case RELEASED:
                        if (pressed) {
                            if (passcode[n_temp] == kpd.key[i].kchar) {
                                pressed = 0;
                                released = 1;
                                n_temp++;
                                if (n_temp > n-1) return 1;
                            }
                            else {
                                pressed = 0;
                                released = 0;
                                n_temp = 0;
                            }
                        }
                        else {
                            pressed = 0;
                            released = 0;
                            n_temp = 0;
                        }
                        msg = " RELEASED";
                        break;
                    case IDLE:
                        msg = " IDLE";
                        break;
                }
                Serial.print("Key ");
                Serial.print(kpd.key[i].kchar);
                Serial.println(msg);
                // Serial.print("n_temp: ");
                // Serial.print(n_temp);
                // Serial.print(" pressed: ");
                // Serial.print(pressed);
                // Serial.print(" released: ");
                // Serial.println(released);
            }
        }
    }
    return 0;    
}

void read_keypad()
{

    // Fills kpd.key[ ] array with up-to 10 active keys.
    // Returns true if there are ANY active keys.
    if (kpd.getKeys())
    {
        for (int i = 0; i < LIST_MAX; i++) // Scan the whole key list.
        {
            if (kpd.key[i].stateChanged) // Only find keys that have changed state.
            {
                switch (kpd.key[i].kstate)
                { // Report active key state : IDLE, PRESSED, HOLD, or RELEASED
                case PRESSED:
                    msg = " PRESSED.";
                    break;
                case HOLD:
                    msg = " HOLD.";
                    break;
                case RELEASED:
                    msg = " RELEASED.";
                    break;
                case IDLE:
                    msg = " IDLE.";
                }
                Serial.print("Key ");
                Serial.print(kpd.key[i].kchar);
                Serial.println(msg);
            }
        }
    }
} // End loop

bool is_getKeys() {
    return kpd.getKeys();
}

Key getKeypadKey(int i) {
    return kpd.key[i];
}

bool isRestPressed() {
    bool isFirst3 = kpd.isPressed('1') || kpd.isPressed('2') || kpd.isPressed('5');
    bool isSecond3 = kpd.isPressed('6') || kpd.isPressed('8') || kpd.isPressed('9');
    bool isLast3 = kpd.isPressed('*') || kpd.isPressed('0') || kpd.isPressed('#');
    return isFirst3 || isSecond3 || isLast3;
}

void read_keypad_keys(char *shape_code) {
    String first = String(shape_code[0]) + "" + String(shape_code[1]);
    String second = String(shape_code[2]) + "" + String(shape_code[3]);
    String third = String(shape_code[4]) + "" + String(shape_code[5]);

    if (kpd.getKeys()) {
        if (kpd.isPressed('3')) {
            text_to_display = first;
        } else if (kpd.isPressed('4')) {
            text_to_display = second;
        } else if (kpd.isPressed('7')) {
            text_to_display = third;
        } else if (isRestPressed()) {
            text_to_display = String(getRandInt(1, 99));
        }
    }
    displayText(text_to_display, 5, 5, 2);
}