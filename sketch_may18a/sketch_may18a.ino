//there are many open source code for wemos and dht sensor. This sketch is simple.
#include "DHT.h"
//#include <WiFiUdp.h>
#include <NTPClient.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#define DHTPIN 13
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
WiFiClient wifiClient;
HTTPClient http;    // Declare object of class HTTPClient
const long utcOffsetInSeconds = 3600;
// A UDP instance to let us send and receive packets over UDP
// WiFiUDP ntpUDP;
// NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds); 


void setup() {
  Serial.begin(115200);
  WiFi.begin("KhaiDepChai", "654123456");//WiFi name and password
  dht.begin(); //start the temp reading (agian only for temperature sensor
}

void loop() {
  //while(!timeClient.update()) 
    //{timeClient.forceUpdate();}
  //read the temperature and humidity (temperature sensor specific code)
  float humidity = dht.readHumidity(); //read humidity
  float temperature = dht.readTemperature(); //read temperature (C)
  //String zeit = timeClient.getFormattedTime() ;//read time

  send_to_server(humidity, temperature);

  // check if returns are valid
  /*if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT");
  } else {  //if it read correctly
    Serial.print(humidity);     //humidity
    Serial.print(" \t"); //tab
    Serial.println(temperature);   //temperature (C)
  }*/
  delay(1000);
}

void send_to_server(float t,float h) {
  String postData = "temperatur=" + (String)t + " & " + "humidity=" + (String)h;
  // Check WiFi connection status
  Serial.println(postData);
  Serial.println(WiFi.status());
  if (WiFi.status() == WL_CONNECTED) 
  { 
    // type your domain name or Node-RED IP address, so the ESP publishes the readings to your own server.
    // if the sensor data do not display in web page, you have to check the status of port 3007. Sometimes the port is not available！
    http.begin(wifiClient,"http://192.168.1.123:3007/api/dataSave");
    // Specify content-type header
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    // Send the request
    int httpCode = http.POST(postData);   
    // Print HTTP return code
    Serial.println(httpCode);
    // Close connection
    http.end();
    //Serial.println(postData);
  }
  else 
  {
    Serial.println("Error in WiFi connection");
  }
}
