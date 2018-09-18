
#define PIN_ANALOG_X 32
#define PIN_ANALOG_Y 33

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

BLECharacteristic *pCharacteristic;
bool deviceConnected = false;
uint8_t txValue = 0;
int y[7]={16,17,18,19,21,22,23};
int BLEPubInterval =100;
long BLElastMsg = 0;//存放时间的变量 
String rxload;

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

void setupBLE(String BLEName){
  const char *ble_name=BLEName.c_str();
  BLEDevice::init(ble_name);
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID_TX,BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID_RX,BLECharacteristic::PROPERTY_WRITE);
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("Waiting a client connection to notify...");
}

static void BLEPub(){
   long BLEnow = millis();//记录当前时间
    if (BLEnow - BLElastMsg > BLEPubInterval) 
    {//每隔BLEPubInterval毫秒发一次信号
        if (deviceConnected&&rxload.length()>0) {
          String str=rxload;
          const char *newValue=str.c_str();
          pCharacteristic->setValue(newValue);
          pCharacteristic->notify();
        }
      BLElastMsg = BLEnow;//刷新上一次发送数据的时间
    }
}

void build_BLE_MSG(int lr,int ud,int b){
  rxload="";
  if(lr<900){
    rxload+='l';
  }
  else if(lr>2900){
    rxload+='r';
  }
  else{
      if(ud<900){
        rxload+='d';
      }
      else if(ud>2900){
        rxload+='u';
      }
      else{
        rxload+='n';
      }
  }
  rxload+=b;
}

void setup() {
  Serial.begin(115200);
  for(int i=0;i<7;i++){
    pinMode(y[i],INPUT);
    digitalWrite(y[i],HIGH);
  }
  setupBLE("Rocker");
  
}


void loop() {
  int lr=analogRead(PIN_ANALOG_X);
  int ud=analogRead(PIN_ANALOG_Y);
  int b=7;
  
  for(int i=0;i<7;i++){
    if(digitalRead(y[i])==LOW){
      Serial.print("Button ");
      b=i;
      Serial.print(char(b+'A'));
      Serial.println(" is pressed");
    }
  }
    
  if(lr<900){
    Serial.println("left");
  }
  else if(lr>2900){
    Serial.println("right");
  }
  else{
    Serial.println("normall");
  }
  if(ud<900){
    Serial.println("down");
  }
  else if(ud>2900){
    Serial.println("up");
  }
  else{
    Serial.println("normall");
  }
  build_BLE_MSG(lr,ud,b);
  BLEPub();
  Serial.println(rxload);
}
