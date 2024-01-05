#include "utilities.h"

void send_to_socket(int current_puzzle, String data) {
  String json = "{\"completed\":\"";
  json += (String) current_puzzle;
  json += "\",\"data\":\"";
  json += data;
  json += "\"}";
  ws.broadcastTXT(json);
}