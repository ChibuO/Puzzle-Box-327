#include <oled.h>

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// https://lastminuteengineers.com/oled-display-esp32-tutorial/

void oled_setup()
{
    // initialize the OLED object
    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
    {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;)
            ; // Don't proceed, loop forever
    }
    Serial.println("done with screen");

    // Clear the buffer
    display.clearDisplay();
}

int getTotalPages(String text) {
    int totalCharacters = text.length();
    
    // Calculate pages using ceiling division
    int totalPages = (totalCharacters + CHARACTERS_PER_PAGE - 1) / CHARACTERS_PER_PAGE;
    return totalPages;
}

void displayBasicText(String text) {
    display.clearDisplay();
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.println(text);
    display.display();
}

void displayText(String text, int x, int y, int size) {
    display.clearDisplay();
    display.setTextColor(WHITE);
    if (getTotalPages(text) > 2 && size > 1) {
        display.setCursor(0, 0);
        display.setTextSize(1);
    } else {
        display.setCursor(x, y);
        display.setTextSize(size);
    }
    Serial.println();
    display.println(text);
    display.display();
}

void displayScrollLeft() {
    display.startscrollleft(0x00, 0x07);
}

void displayScrollRight() {
    display.startscrollright(0x00, 0x07);
}

void clearDisplay() {
    display.clearDisplay();
}

void oled_loop() {

}