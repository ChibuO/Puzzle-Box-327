#include <password.h>

const byte ROWS = 4; // four rows
const byte COLS = 3; // three columns

char keys[ROWS][COLS] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'*', '0', '#'}};
byte rowPins[ROWS] = {17, 15, 2, 4}; // connect to the row pinouts of the kpd
byte colPins[COLS] = {16, 5, 0};     // connect to the column pinouts of the kpd
// byte rowPins[ROWS] = {1, 17, 5, 19}; // connect to the row pinouts of the kpd
// byte colPins[COLS] = {3, 23, 18};  


Keypad kpd = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

unsigned long loopCount;
unsigned long startTime;
String msg;
int pressed = 0;
int released = 0;
int n_temp = 0;

void keypad_setup()
{
    Serial.begin(9600);
    loopCount = 0;
    startTime = millis();
    msg = "";
}

int getPressed(int n, int *code) {
    if (kpd.getKeys()) {
        for (int i = 0; i < LIST_MAX; i++) {
            if (kpd.key[i].stateChanged) {
                switch (kpd.key[i].kstate) { 
                    // Report active key state : IDLE, PRESSED, HOLD, or RELEASED
                    case PRESSED:
                        if (code[n_temp] == kpd.key[i].kchar) {
                            released = 0;
                            pressed = 1;
                        }
                        else {
                            released = 0;
                            pressed = 0;
                            n_temp = 0;
                        }
                        msg = " PRESSED";
                        break;
                    case HOLD:
                        break;
                        msg = " HOLD";
                    case RELEASED:
                        if (pressed) {
                            if (code[n_temp] == kpd.key[i].kchar) {
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
                Serial.print("n_temp: ");
                Serial.print(n_temp);
                Serial.print(" pressed: ");
                Serial.print(pressed);
                Serial.print(" released: ");
                Serial.println(released);
            }
        }
    }
    return 0;    
}

char keypad_check_password(int n, char *code)
{
    int n_temp = 0;
    int pressed = 0;
    int released = 0;
    int done = 0;
    // check for press
    
    while (n_temp < n)
    {   
        
        while (!done)
        {
            if (kpd.getKeys())
            {
                for (int i = 0; i < LIST_MAX; i++)
                {
                    if (kpd.key[i].stateChanged)
                    {
                        switch (kpd.key[i].kstate)
                        { // Report active key state : IDLE, PRESSED, HOLD, or RELEASED
                        case PRESSED:
                            if (code[n_temp] == kpd.key[i].kchar)
                            {
                                released = 0;
                                pressed = 1;
                            }
                            else
                            {
                                released = 0;
                                pressed = 0;
                                n_temp = 0;
                            }
                            msg = " PRESSED";
                            break;
                        case HOLD:
                            break;
                            msg = " HOLD";
                        case RELEASED:
                            if (pressed)
                            {
                                if (code[n_temp] == kpd.key[i].kchar)
                                {
                                    pressed = 0;
                                    released = 1;
                                    n_temp++;
                                    if (n_temp > n-1) done = 1;
                                }
                                else
                                {
                                    pressed = 0;
                                    released = 0;
                                    n_temp = 0;
                                }
                            }
                            else
                            {
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
                        Serial.print("n_temp: ");
                        Serial.print(n_temp);
                        Serial.print(" pressed: ");
                        Serial.print(pressed);
                        Serial.print(" released: ");
                        Serial.println(released);
                    }
                }
            }
        }
    }
    // check for release
    // go to next number
    return 1;
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