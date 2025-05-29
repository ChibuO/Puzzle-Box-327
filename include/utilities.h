#ifndef UTILITIES_H
#define UTILITIES_H
    #include <Arduino.h>
    #include "server.h"

    void send_to_socket(int current_puzzle, String data);
    int getRandInt(int lower, int upper);

#endif /* UTILITIES_H */