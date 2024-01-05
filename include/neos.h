#ifndef NEOS_H_
#define NEOS_H_
    #include <Adafruit_NeoPixel.h>
    // #include <Arduino_FreeRTOS.h>
    // #ifdef __AVR__
    //     #include <avr/power.h> // Required for 16 MHz Adafruit Trinket
    // #endif
    
    // Which pin on the Arduino is connected to the NeoPixels?
    // On a Trinket or Gemma we suggest changing this to 1:
    #define NEOS_LED_PIN    12

    // How many NeoPixels are attached to the Arduino?
    #define LED_COUNT 8

    // Declare our NeoPixel strip object:
    // Adafruit_NeoPixel strip(LED_COUNT, NEOS_LED_PIN, NEO_GRB + NEO_KHZ800);
    // Argument 1 = Number of pixels in NeoPixel strip
    // Argument 2 = Arduino pin number (most are valid)
    // Argument 3 = Pixel type flags, add together as needed:
    //   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
    //   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
    //   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
    //   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
    //   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)

    void neopixel_setup();
    uint32_t rgb_to_binary(uint8_t r, uint8_t g, uint8_t b);
    void colorWipe(uint32_t color, int wait);
    void theaterChase(uint32_t color, int wait);
    void rainbow(Adafruit_NeoPixel strip, int wait);
    void theaterChaseRainbow(Adafruit_NeoPixel strip, int wait);
    void neos_main();

    void neopixel_puzzle(int wait);
    bool neos_plus_keypad(int wait);
    void getFreqs(int * p);
    void looping_neos(  void *pvParameters );
    void lightNeos(char key);

    extern bool pause_lights;

#endif /* NEOS_H */