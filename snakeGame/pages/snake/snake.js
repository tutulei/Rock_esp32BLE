//snake.js
var app = getApp();
var serviceId = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
var deviceId = "30:AE:A4:84:24:D6"
var characteristicId = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
var rxvalue = ''
var b = ''
var d = ''
Page({
   data:{
        score: 0,//比分
        maxscore: 0,//最高分
        startx: 0,
        starty: 0,
        endx:0,
        endy:0,//以上四个做方向判断来用
        ground:[],//存储操场每个方块
        rows:28,
        cols:22,//操场大小
        snake:[],//存蛇
        food:[],//存食物
        direction:'',//方向
        modalHidden: true,
        timer:'',
   } ,
   onLoad:function(){
     
       var maxscore = wx.getStorageSync('maxscore');
       if(!maxscore) maxscore = 0
        this.setData({
        maxscore:maxscore
        });
        
        this.initGround(this.data.rows,this.data.cols);//初始化操场
        this.connectble();//连接蓝牙
        this.initSnake(3);//初始化蛇
        this.creatFood();//初始化食物
        this.move();//蛇移动
   },
   //计分器
    storeScore:function(){

      if(this.data.maxscore < this.data.score){
      this.setData({
        maxscore:this.data.score
        })
        wx.setStorageSync('maxscore', this.data.maxscore)
      }
  },
  //操场
    initGround:function(rows,cols){
        for(var i=0;i<rows;i++){
            var arr=[];
            this.data.ground.push(arr);
            for(var j=0;j<cols;j++){
                this.data.ground[i].push(0);
            }
        }
    },
   //蛇
   initSnake:function(len){
       for(var i=0;i<len;i++){
           this.data.ground[0][i]=1;
           this.data.snake.push([0,i]);
       }
   },
   //移动函数
   move:function(){
       var that=this;
       this.data.timer=setInterval(function(){
           that.blegetdata()
           that.changeDirection(that.data.direction);
         console.log("mmm", that.data.direction);
            that.setData({
               ground:that.data.ground
           });
       },100);
   },
   blegetdata:function(){
      var that=this;
      switch (b) {

        case '0':
          if (that.data.direction != 'bottom')that.data.direction = 'top';
          break;
        case '1':
          if (that.data.direction != 'left')that.data.direction = 'right';
          break;
        case '2':
          if (that.data.direction != 'top')that.data.direction = 'bottom';
          break;
        case '3':
          if (that.data.direction != 'right')that.data.direction = 'left';
          break;
        default:
          switch (d) {
            case 'l':
              if (that.data.direction != 'right')that.data.direction = 'left';
              break;
            case 'r':
              if (that.data.direction != 'left')that.data.direction = 'right';
              break;
            case 'u':
              if (that.data.direction != 'bottom')that.data.direction = 'top';
              break;
            case 'd':
              if (that.data.direction != 'top')that.data.direction = 'bottom';
              break;
          }
      }
    },
    tapStart: function(event){
        this.setData({
            startx: event.touches[0].pageX,
            starty: event.touches[0].pageY
            })
    },
    tapMove: function(event){
        this.setData({
            endx: event.touches[0].pageX,
            endy: event.touches[0].pageY
            })
    },
    tapEnd: function(event){
        var heng = (this.data.endx) ? (this.data.endx - this.data.startx) : 0;
        var shu = (this.data.endy) ? (this.data.endy - this.data.starty) : 0;

        if(Math.abs(heng) > 5 || Math.abs(shu) > 5){
            var direction = (Math.abs(heng) > Math.abs(shu)) ? this.computeDir(1, heng):this.computeDir(0, shu);
            switch(direction){
            case 'left':
                if(this.data.direction=='right')return;
                break;
            case 'right':
                if(this.data.direction=='left')return;
                break;
            case 'top':
                if(this.data.direction=='bottom')return;
                break;
            case 'bottom':
                if(this.data.direction=='top')return;
                break;
            default:
        }
        this.setData({
        startx:0,
        starty:0,
        endx:0,
        endy:0,
        direction:direction
        })
        
    }
    },
    computeDir: function(heng, num){
    if(heng) return (num > 0) ? 'right' : 'left';
    return (num > 0) ? 'bottom' : 'top';
    },
    creatFood:function(){
        var x=Math.floor(Math.random()*this.data.rows);
        var y=Math.floor(Math.random()*this.data.cols);
        var ground= this.data.ground;
        ground[x][y]=2;
        this.setData({
            ground:ground,
            food:[x,y]
        });
    },
    changeDirection:function(dir){
        switch(dir){
        case 'left':
            return this.changeLeft();
            break;
        case 'right':
            return this.changeRight();
            break;
        case 'top':
            return this.changeTop();
            break;
        case 'bottom':
            return this.changeBottom();
            break;
        default:
        }
    },
    changeLeft:function(){
        
        var arr=this.data.snake;
        var len=this.data.snake.length;
        var snakeHEAD=arr[len-1][1];
        var snakeTAIL=arr[0];
        var ground=this.data.ground;
        ground[snakeTAIL[0]][snakeTAIL[1]]=0;  
        for(var i=0;i<len-1;i++){
                arr[i]=arr[i+1];   
        };

        var x=arr[len-1][0];
        var y=arr[len-1][1]-1;
        arr[len-1]=[x,y];
            this.checkGame(snakeTAIL);
        for(var i=1;i<len;i++){
            ground[arr[i][0]][arr[i][1]]=1;
        } 
        
    this.setData({
                ground:ground,
            snake:arr
        });
        
        return true;
    },
    changeRight:function(){
        
        var arr=this.data.snake;
        var len=this.data.snake.length;
        var snakeHEAD=arr[len-1][1];
        var snakeTAIL=arr[0];
        var ground=this.data.ground;
        ground[snakeTAIL[0]][snakeTAIL[1]]=0;  
        for(var i=0;i<len-1;i++){
                arr[i]=arr[i+1];   
        };

        var x=arr[len-1][0];
        var y=arr[len-1][1]+1;
        arr[len-1]=[x,y];
        this.checkGame(snakeTAIL);
        for(var i=1;i<len;i++){
            ground[arr[i][0]][arr[i][1]]=1;

        } 
        
        this.setData({
                ground:ground,
            snake:arr
        });
        
        
    //    var y=this.data.snake[0][1];
    //    var x=this.data.snake[0][0];
    //     this.data.ground[x][y]=0;
    //     console.log(this.data.ground[x]);
    //      console.log(this.data.snake);
    //     for(var i=0;i<this.data.snake.length-1;i++){
    //         this.data.snake[i]=this.data.snake[i+1];
    //     }
    //     this.data.snake[this.data.snake.length-1][1]++;
    //     for(var j=1;j<this.data.snake.length;j++){
    //         this.data.ground[this.data.snake[j][0]][this.data.snake[j][1]]=1;
    //     }
        return true;
    },
    changeTop:function(){
        
        var arr=this.data.snake;
        var len=this.data.snake.length;
        var snakeHEAD=arr[len-1][1];
        var snakeTAIL=arr[0];
        var ground=this.data.ground;
        ground[snakeTAIL[0]][snakeTAIL[1]]=0;  
        for(var i=0;i<len-1;i++){
                arr[i]=arr[i+1];   
        };

        var x=arr[len-1][0]-1;
        var y=arr[len-1][1];
        arr[len-1]=[x,y];
            this.checkGame(snakeTAIL);
        for(var i=1;i<len;i++){
            ground[arr[i][0]][arr[i][1]]=1;
        } 
        this.setData({
            ground:ground,
            snake:arr
        });
      
        return true;
    },
    changeBottom:function(){
        
        var arr=this.data.snake;
        var len=this.data.snake.length;
        var snakeHEAD=arr[len-1];
        var snakeTAIL=arr[0];
        var ground=this.data.ground;
        
        ground[snakeTAIL[0]][snakeTAIL[1]]=0;  
        for(var i=0;i<len-1;i++){
                arr[i]=arr[i+1];   
        };
        var x=arr[len-1][0]+1;
        var y=arr[len-1][1];
        arr[len-1]=[x,y];
        this.checkGame(snakeTAIL);
        for(var i=1;i<len;i++){
            ground[arr[i][0]][arr[i][1]]=1;
        } 
        this.setData({
            ground:ground,
            snake:arr
        });
        return true;
    },
    checkGame:function(snakeTAIL){
        var arr=this.data.snake;
        var len=this.data.snake.length;
        var snakeHEAD=arr[len-1];
        if(snakeHEAD[0]<0||snakeHEAD[0]>=this.data.rows||snakeHEAD[1]>=this.data.cols||snakeHEAD[1]<0){
                clearInterval(this.data.timer);
                    this.setData({
                    modalHidden: false,
                        })  
          // while (!this.data.modalHidden) {
          //   if (b == '4' || b == '5' | b == '6') {
          //     modalChange();
          //   }
          // }
        }
        for(var i=0;i<len-1;i++){
            if(arr[i][0]==snakeHEAD[0]&&arr[i][1]==snakeHEAD[1]){
                clearInterval(this.data.timer);
                    this.setData({
                        modalHidden: false,
                    })
            //   while (!this.data.modalHidden) {
            //     if (b == '4' || b == '5' | b == '6') {
            //       modalChange();
            //     }
            //   }
             }
        }
        if(snakeHEAD[0]==this.data.food[0]&&snakeHEAD[1]==this.data.food[1]){
            arr.unshift(snakeTAIL);
            this.setData({
                score:this.data.score+10
            });
            this.storeScore();
            this.creatFood();
        }
        
        
    },
    modalChange:function(){
    this.setData({
            score: 0,
        ground:[],
        snake:[],
            food:[],
            modalHidden: true,
            direction:''
    })
    this.onLoad();
    },
  connectble: function () {
    //蓝牙接口
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log(res)
      }
    })
    wx.startBluetoothDevicesDiscovery({
      services: [serviceId],
      success: function (res) {
        console.log(res)
      }
    })

    wx.createBLEConnection({
      deviceId: deviceId,
      success: function (res) {
        console.log(res)
        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res)
            wx.notifyBLECharacteristicValueChange({
              state: true, // 启用 notify 功能
              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  
              deviceId: deviceId,
              // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
              serviceId: serviceId,
              // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
              characteristicId: characteristicId,
              success: function (res) {
                console.log('nChange success', res.errMsg)
              }
            })
          }
        })
      }
    })

    // ArrayBuffer转16进度字符串示例
    // function ab2hex(buffer) {
    //   var hexArr = Array.prototype.map.call(
    //     new Uint8Array(buffer),
    //     function (bit) {
    //       return ('00' + bit.toString(16)).slice(-2);

    //     }
    //   )
    //   return hexArr.join('');
    // }
    function ab2hex(arrayBuffer){
      let unit8Arr = new Uint8Array(arrayBuffer);
      let encodedString = String.fromCharCode.apply(null, unit8Arr),
        decodedString = decodeURIComponent(escape((encodedString)));//没有这一步中文会乱码
      return decodedString;
    }

    wx.onBLECharacteristicValueChange(function (res) {
        rxvalue= ab2hex(res.value)
        d=rxvalue[0]
        b=rxvalue[1]
      console.log('aaa',b)
    })

  },
});
