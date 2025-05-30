#ifndef OLED_H
#define OLED_H
    #include <Arduino.h>
    #include <Wire.h>
    #include <Adafruit_GFX.h>
    #include <Adafruit_SSD1306.h>

    #define SCREEN_WIDTH 128 // OLED display width, in pixels
    #define SCREEN_HEIGHT 32 // OLED display height, in pixels

    // Declaration for SSD1306 display connected using I2C
    #define OLED_RESET     -1 // Reset pin
    #define SCREEN_ADDRESS 0x3C
    #define CHARACTERS_PER_PAGE 10

    void oled_setup();
    void oled_loop();
    void displayBasicText(String text);
    void displayText(String text, int x, int y, int size);
    void clearDisplay();
    void displayHorizontalBounce();
    void displayScrollLeft();
    void displayScrollRight();

#endif /* OLED_H */