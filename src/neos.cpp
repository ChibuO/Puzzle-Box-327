// A basic everyday NeoPixel strip test program.

// NEOPIXEL BEST PRACTICES for most reliable operation:
// - Add 1000 uF CAPACITOR between NeoPixel strip's + and - connections.
// - MINIMIZE WIRING LENGTH between microcontroller board and first pixel.
// - NeoPixel strip's DATA-IN should pass through a 300-500 OHM RESISTOR.
// - AVOID connecting NeoPixels on a LIVE CIRCUIT. If you must, ALWAYS
//   connect GROUND (-) first, then +, then data.
// - When using a 3.3V microcontroller with a 5V-powered NeoPixel strip,
//   a LOGIC-LEVEL CONVERTER on the data line is STRONGLY RECOMMENDED.
// (Skipping these may work OK on your workbench but can fail in the field)

#include "neos.h"

// Which pin on the Arduino is connected to the NeoPixels?
// On a Trinket or Gemma we suggest changing this to 1:
//#define LED_PIN    13

// How many NeoPixels are attached to the Arduino?
//#define LED_COUNT 8

// Declare our NeoPixel strip object:
Adafruit_NeoPixel strip(LED_COUNT, NEOS_LED_PIN, NEO_GRB + NEO_KHZ800);
// Argument 1 = Number of pixels in NeoPixel strip
// Argument 2 = Arduino pin number (most are valid)
// Argument 3 = Pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
//   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)


// setup() function -- runs once at startup --------------------------------

void neopixel_setup() {
  // These lines are specifically to support the Adafruit Trinket 5V 16 MHz.
  // Any other board, you can remove this part (but no harm leaving it):
#if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
#endif
  // END of Trinket-specific code.

  strip.begin();           // INITIALIZE NeoPixel strip object (REQUIRED)
  strip.show();            // Turn OFF all pixels ASAP
  strip.setBrightness(50); // Set BRIGHTNESS to about 1/5 (max = 255)
}


// Some functions of our own for creating animated effects -----------------

// Fill strip pixels one after another with a color. Strip is NOT cleared
// first; anything there will be covered pixel by pixel. Pass in color
// (as a single 'packed' 32-bit value, which you can get by calling
// strip.Color(red, green, blue) as shown in the loop() function above),
// and a delay time (in milliseconds) between pixels.
void colorWipe(uint32_t color, int wait) {
  for(int i=0; i<strip.numPixels(); i++) { // For each pixel in strip...
    strip.setPixelColor(i, color);         //  Set pixel's color (in RAM)
    strip.show();                          //  Update strip to match
    delay(wait);                           //  Pause for a moment
  }
}

void colorWipe2(int * frenqs, int num_colors, int wait) {
  uint32_t rainbow_colors[] = {
    rgb_to_binary(255, 0, 0),
    rgb_to_binary(255, 128, 0),
    rgb_to_binary(255, 236, 64),
    rgb_to_binary(3, 136, 51),
    rgb_to_binary(3, 113, 136),
    rgb_to_binary(144, 0, 255),
    rgb_to_binary(221, 53, 240)};

  int freqs[] = {2, 1, 3, 1, 2, 5, 3}; 

  num_colors = 17;
  
  int color_index = 0;
  int freq_index = 0;
  int pix_count = 0; //number to nount up to
  int pix_index = pix_count + color_index; //number that's counting
  int rep_counter = 1;
  bool freq_flag = 0;

  for(int b = 0; b < 100; b++) {
    for(int d = strip.numPixels()-1; d > -1; d--) {
      uint32_t color = rainbow_colors[pix_index];
      color = strip.gamma32(color);
      strip.setPixelColor(d, color);
      
      Serial.print(rep_counter);
      Serial.print(" - ");
      Serial.print(freq_index);
      Serial.print(" : ");
      Serial.print(freqs[freq_index]);

      if (freqs[freq_index] == rep_counter) {
        freq_index++;
        rep_counter = 1;
        pix_index = pix_count + color_index;
        color_index++;
        freq_flag = 1;
      } else {
        rep_counter++;
      }

      if (pix_index > num_colors-1) {
        pix_index = pix_index - num_colors;
      }

      Serial.print(" so ");
      Serial.println(pix_index);

      

      if (color_index == strip.numPixels()) {
        color_index = 0;
      }
    }
    strip.show();
    delay(10000);

    if (freq_flag == 1) {
      if (pix_count == num_colors-1) {
        pix_count = 0;
        freq_index = 0;
      } else {
        pix_count++;
      }
      freq_flag = 0;
    }
    
  }
}

// Theater-marquee-style chasing lights. Pass in a color (32-bit value,
// a la strip.Color(r,g,b) as mentioned above), and a delay time (in ms)
// between frames.
void theaterChase(uint32_t color, int wait) {
  for(int a=0; a<10; a++) {  // Repeat 10 times...
    for(int b=0; b<3; b++) { //  'b' counts from 0 to 2...
      strip.clear();         //   Set all pixels in RAM to 0 (off)
      // 'c' counts up from 'b' to end of strip in steps of 3...
      for(int c=b; c<strip.numPixels(); c += 1) {
        strip.setPixelColor(c, color); // Set pixel 'c' to value 'color'
      }
      strip.show(); // Update strip with new contents
      delay(wait);  // Pause for a moment
    }
  }
}

// Rainbow cycle along whole strip. Pass delay time (in ms) between frames.
void rainbow(Adafruit_NeoPixel strip, int wait) {
  // Hue of first pixel runs 5 complete loops through the color wheel.
  // Color wheel has a range of 65536 but it's OK if we roll over, so
  // just count from 0 to 5*65536. Adding 256 to firstPixelHue each time
  // means we'll make 5*65536/256 = 1280 passes through this loop:
  for(long firstPixelHue = 0; firstPixelHue < 5*65536; firstPixelHue += 256) {
    // strip.rainbow() can take a single argument (first pixel hue) or
    // optionally a few extras: number of rainbow repetitions (default 1),
    // saturation and value (brightness) (both 0-255, similar to the
    // ColorHSV() function, default 255), and a true/false flag for whether
    // to apply gamma correction to provide 'truer' colors (default true).
    strip.rainbow(firstPixelHue);
    // Above line is equivalent to:
    // strip.rainbow(firstPixelHue, 1, 255, 255, true);
    strip.show(); // Update strip with new contents
    delay(wait);  // Pause for a moment
  }
}

// Rainbow-enhanced theater marquee. Pass delay time (in ms) between frames.
void theaterChaseRainbow(Adafruit_NeoPixel strip, int wait) {
  int firstPixelHue = 0;     // First pixel starts at red (hue 0)
  for(int a=0; a<30; a++) {  // Repeat 30 times...
    for(int b=0; b<3; b++) { //  'b' counts from 0 to 2...
      strip.clear();         //   Set all pixels in RAM to 0 (off)
      // 'c' counts up from 'b' to end of strip in increments of 3...
      for(int c=b; c<strip.numPixels(); c += 3) {
        // hue of pixel 'c' is offset by an amount to make one full
        // revolution of the color wheel (range 65536) along the length
        // of the strip (strip.numPixels() steps):
        int      hue   = firstPixelHue + c * 65536L / strip.numPixels();
        uint32_t color = strip.gamma32(strip.ColorHSV(hue)); // hue -> RGB
        strip.setPixelColor(c, color); // Set pixel 'c' to value 'color'
      }
      strip.show();                // Update strip with new contents
      delay(wait);                 // Pause for a moment
      firstPixelHue += 65536 / 90; // One cycle of color wheel over 90 frames
    }
  }
}

uint32_t rgb_to_binary(uint8_t r, uint8_t g, uint8_t b) {
  return ((uint32_t)r << 16) | ((uint32_t)g << 8) | b;
}


static int randInt(int lower, int upper) { //lower and upper included
  // int i;
  // for (i = 0; i < count; i++) {
  //     int num = (rand() %
  //     (upper - lower + 1)) + lower;
  // }
  int num = (rand() % (upper - lower + 1)) + lower;
  return num;
}

void setFrequencies(int * freqs) {
  for (int i = 0; i < 7; i++) {
    freqs[i] = randInt(1, 9);
  }
  Serial.println("freqs");
  for (int i = 0; i < 7; i++) {
    Serial.println(String(freqs[i]));
  }
  // int red_freq = randInt(0, 9);
  // int red_freq = randInt(0, 9);
  // int red_freq = randInt(0, 9);
  // int red_freq = randInt(0, 9);
  // int red_freq = randInt(0, 9);
  // int red_freq = randInt(0, 9);
  // int red_freq = randInt(0, 9);
}

void neos_main() {
  int freqs[7];
  setFrequencies(freqs);
  int num_colors;
  for(int i=0; i < 7; i++) {
    num_colors += freqs[i];
  }
  colorWipe2(freqs, num_colors, 400);

  // // Fill along the length of the strip in various colors...
  // colorWipe(rgb_to_binary(255,   0,   0), 75); // Red
  // colorWipe(rgb_to_binary(  0, 255,   0), 50); // Green
  // colorWipe(rgb_to_binary(  0,   0, 255), 50); // Blue

  // Do a theater marquee effect in various colors...
  // theaterChase(rgb_to_binary(127, 127, 127), 100); // White, half brightness
  // theaterChase(rgb_to_binary(127,   0,   0), 75); // Red, half brightness
  // theaterChase(rgb_to_binary(  0,   0, 127), 25); // Blue, half brightness

  // rainbow(strip, 10);             // Flowing rainbow cycle along the whole strip
  // theaterChaseRainbow(strip, 50); // Rainbow-enhanced theaterChase variant
  colorWipe(rgb_to_binary(0,0,0), 100);
}
