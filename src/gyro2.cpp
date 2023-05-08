#include "imu.h"

Adafruit_MPU6050 mpu;
float AccX, AccY, AccZ;
float GyroX, GyroY, GyroZ;
float accAngleX, accAngleY, gyroAngleX, gyroAngleY, gyroAngleZ;
float roll, pitch, yaw;
float AccErrorX, AccErrorY, GyroErrorX, GyroErrorY, GyroErrorZ;
float elapsedTime, currentTime, previousTime;

void calculate_IMU_error() {
  // We can call this funtion in the setup section to calculate the accelerometer and gyro data error. From here we will get the error values used in the above equations printed on the Serial Monitor.
  // Note that we should place the IMU flat in order to get the proper values, so that we then can the correct values
  // Read accelerometer values 200 times
  int c = 0;
  sensors_event_t a, g, temp;
  while (c < 200) {
    mpu.getEvent(&a, &g, &temp);

    AccX = a.acceleration.x;
    AccY = a.acceleration.y;
    AccZ = a.acceleration.z;

    // Sum all readings
    AccErrorX = AccErrorX + ((atan((AccY) / sqrt(pow((AccX), 2) + pow((AccZ), 2))) * 180 / PI));
    AccErrorY = AccErrorY + ((atan(-1 * (AccX) / sqrt(pow((AccY), 2) + pow((AccZ), 2))) * 180 / PI));
    c++;
  }
  //Divide the sum by 200 to get the error value
  AccErrorX = AccErrorX / 200;
  AccErrorY = AccErrorY / 200;
  c = 0;
  // Read gyro values 200 times
  while (c < 200) {
    mpu.getEvent(&a, &g, &temp);

    GyroX = g.gyro.x;
    GyroY = g.gyro.y;
    GyroZ = g.gyro.z;

    // Sum all readings
    GyroErrorX = GyroErrorX + (GyroX / 131.0);
    GyroErrorY = GyroErrorY + (GyroY / 131.0);
    GyroErrorZ = GyroErrorZ + (GyroZ / 131.0);
    c++;
  }
  //Divide the sum by 200 to get the error value
  GyroErrorX = GyroErrorX / 200;
  GyroErrorY = GyroErrorY / 200;
  GyroErrorZ = GyroErrorZ / 200;
  // Print the error values on the Serial Monitor
  Serial.print("AccErrorX: ");
  Serial.println(AccErrorX);
  Serial.print("AccErrorY: ");
  Serial.println(AccErrorY);
  Serial.print("GyroErrorX: ");
  Serial.println(GyroErrorX);
  Serial.print("GyroErrorY: ");
  Serial.println(GyroErrorY);
  Serial.print("GyroErrorZ: ");
  Serial.println(GyroErrorZ);
}

void imu_setup(void) {
  Serial.begin(115200);
  while (!Serial)
    delay(10); // will pause Zero, Leonardo, etc until serial console opens

  Serial.println("Adafruit MPU6050 test!");

  // Try to initialize!
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");

  Serial.println("");
  delay(100);
  calculate_IMU_error();
}

String read_imu() {

    /* Get new sensor events with the readings */
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    AccX = a.acceleration.x;
    AccY = a.acceleration.y;
    AccZ = a.acceleration.z;

    accAngleX = (atan(AccY / sqrt(pow(AccX, 2) + pow(AccZ, 2))) * 180 / PI) - AccErrorX; // AccErrorX ~(0.58) See the calculate_IMU_error()custom function for more details
    accAngleY = (atan(-1 * AccX / sqrt(pow(AccY, 2) + pow(AccZ, 2))) * 180 / PI) + AccErrorY; // AccErrorY ~(-1.58)

    previousTime = currentTime;        // Previous time is stored before the actual time read
    currentTime = millis();            // Current time actual time read
    elapsedTime = (currentTime - previousTime) / 1000; // Divide by 1000 to get seconds

    GyroX = g.gyro.x;
    GyroY = g.gyro.y;
    GyroZ = g.gyro.z;

    GyroX = GyroX + GyroErrorX; // GyroErrorX ~(-0.56)
    GyroY = GyroY - GyroErrorY; // GyroErrorY ~(2)
    GyroZ = GyroZ + GyroErrorZ; // GyroErrorZ ~ (-0.8)

    // Currently the raw values are in degrees per seconds, deg/s, so we need to multiply by sendonds (s) to get the angle in degrees
    //gyroAngleX = gyroAngleX + GyroX * elapsedTime; // deg/s * s = deg
    //gyroAngleY = gyroAngleY + GyroY * elapsedTime;
    yaw =  yaw + GyroZ * elapsedTime;
    // Complementary filter - combine acceleromter and gyro angle values
    //roll = 0.96 * gyroAngleX + 0.04 * accAngleX;
    //pitch = 0.96 * gyroAngleY + 0.04 * accAngleY;

    gyroAngleX = 0.96 * gyroAngleX + 0.04 * accAngleX;
    gyroAngleY = 0.96 * gyroAngleY + 0.04 * accAngleY;

    roll = gyroAngleX;
    pitch = gyroAngleY;

    // Serial.print("AccAngleX: ");
    // Serial.print(accAngleX);
    // Serial.print(" / AccAngleY: ");
    // Serial.print(accAngleY);
    // Serial.print(" / gyAngleX: ");
    // Serial.print(gyroAngleX);
    // Serial.print(" / gyAngleY: ");
    // Serial.print(gyroAngleY);
    // Serial.print(" / gyAngleZ: ");
    // Serial.println(gyroAngleZ);

    String s2 = (String) roll + ", " + (String) pitch + ", " + (String) yaw;
    //String sender = (String) accAngleX + ", " + (String) accAngleY + ", " + (String) AccZ + ", " + (String) gyroAngleX + ", " + (String) gyroAngleY + ", " + (String) gyroAngleZ; 
    return s2;
}