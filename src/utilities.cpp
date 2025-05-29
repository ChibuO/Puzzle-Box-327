#include "utilities.h"

void send_to_socket(int current_puzzle, String data) {
  String json = "{\"completed\":\"";
  json += (String) current_puzzle;
  json += "\",\"data\":\"";
  json += data;
  json += "\"}";
  ws.broadcastTXT(json);
}

int getRandInt(int lower, int upper) {
  // int i;
  // for (i = 0; i < count; i++) {
  //     int num = (rand() %
  //     (upper - lower + 1)) + lower;
  // }
  int num = (rand() % (upper - lower + 1)) + lower;
  return num;
}