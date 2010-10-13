/*
 * jQuery Candlestick Chart
 * Copyright 2010 Shunsuke Ito
 * Released under the MIT and GPL licenses.
 */

(function(jQuery) {
  
  // private
  var st={};
  var chHeight;
  var param;
  var shinWidth;
  var cdStage;
  var cdOffsetX;
  var shinOffsetX;
  var barWidth;

  // 線をシャープに（なんかもっとうまい手はないかなぁ。）
  var _ajustXY = function( p ) {
    if( p%2 === 0 ) { return ( p - 0.5 ); }
    return p;
  };
  
  var is_array = function(value) {
    return(
      value && 
      typeof value === "object" &&
      typeof value.length === "number" &&
      typeof value.splice === "function" &&
      !(value.propertyIsEnumerable('length'))
    );  
  };

  // オプション設定
  var _setOption = function(options) {
    st = $.extend({
      //optionの初期値を設定
      'width' : 400,
      'height' : 300,
      'ofX': 50,
      'ofY': 30,
      'bgColor': "#FFF",
      'cdWidth': 5,
      'cdLineColor': "#000",
      'cdUpColor': "#FFF",
      'cdDownColor': "#000",
      'voColor': "#CCC",
      'liColor': "#CCC",
      'liNum': 5,
      'scale' : 250
      }, options);

    // 座標スケールの変換準備（縦表示領域とスケールの比を求める）
    chHeight = st.height - st.ofY*2;
    param = chHeight / st.scale;

    // ローソクの幅から芯や出来高の幅、間隔を計算
    shinWidth = Math.floor(st.cdWidth /3);
    cdStage = st.cdWidth*2;
    cdOffsetX = st.ofX + cdStage;
    shinOffsetX = cdOffsetX + (st.cdWidth/2);
    barWidth = st.cdWidth;
  };

  // 横罫線の描画
  var _writeScale = function(ctx) {
  
    // 罫線の数字の切りを良くする（変な処理だと僕も思うよ）
    var bline = Math.floor(st.scale/st.liNum).toString();
    var p = bline.charAt(0);
    var l = bline.length;
    for(var i=1; i<l; i++) {
      p += "0";
    }

    p = parseInt(p,10);
    ctx.strokeStyle = st.liColor;
    ctx.textAlign ="right";
    ctx.textBaseline ="middle";
    l= st.liNum;
    for(var i =1; i <= l; i++) {
      ctx.beginPath();
      var y = _ajustXY( st.height - ( p * i * param ) - st.ofY );
      ctx.moveTo( _ajustXY(st.ofX+1) , y );
      ctx.lineTo( _ajustXY(st.width-st.ofX) , y );
      ctx.stroke();
      // 数字
      ctx.strokeText( p*i , st.ofX - 4, y);
    }
    ctx.strokeStyle = st.cdLineColor;
  };

  // <canvas>の初期化
  var _init = function (canvas) {
    var ctx = canvas.getContext('2d');
    $(canvas).css("width", st.width + "px");
    $(canvas).css("height", st.height + "px");
    $(canvas).attr("width", st.width);
    $(canvas).attr("height", st.height);

    // 背景塗りつぶし
    ctx.fillStyle = st.bgColor;
    ctx.fillRect(0, 0, st.width, st.height);

    // 基本枠線
    ctx.strokeStyle = st.cdLineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo( _ajustXY(st.ofX), _ajustXY( st.ofY) );
    ctx.lineTo( _ajustXY(st.ofX), _ajustXY( st.height - st.ofY) );
    ctx.lineTo( _ajustXY(st.width - st.ofX), _ajustXY(st.height - st.ofY));
    ctx.stroke();

    // 横罫線
    _writeScale(ctx);
  };

  // ローソク一本描く
  var _writeCandle = function(ctx,s,e,h,l,d) {
      var stP = s * param; // 初値
      var enP = e * param; // 終値
      var hiP = h * param; // 高値
      var loP = l * param; // 安値

      // 芯を描画
      ctx.lineWidth = shinWidth;
      ctx.beginPath();
      ctx.strokeStyle = st.cdLineColor;
      ctx.moveTo( _ajustXY(d * cdStage + shinOffsetX) , _ajustXY(chHeight - hiP + st.ofY ));
      ctx.lineTo( _ajustXY(d * cdStage + shinOffsetX) , _ajustXY(chHeight - loP + st.ofY ));
      ctx.stroke();
      ctx.lineWidth = 1;

      // 終値が初値より高ければ白、安ければ黒で塗りつぶし
      if( stP < enP ) { ctx.fillStyle = st.cdUpColor; }
      else { ctx.fillStyle = st.cdDownColor; }
      ctx.strokeStyle = st.cdLineColor;
      ctx.fillRect( _ajustXY(d * cdStage + cdOffsetX), _ajustXY(chHeight-stP + st.ofY) , st.cdWidth, stP-enP );
      ctx.strokeRect( _ajustXY(d * cdStage + cdOffsetX), _ajustXY(chHeight-stP + st.ofY) , st.cdWidth, stP-enP );
    };

    // ローソク足の描画
    var _writeCandles = function(canvas,data) {
      var ctx = canvas.getContext('2d');
      var l = data.length;
      for(var i = 0;i < l; i++){
        _writeCandle(ctx,data[i][0],data[i][1],data[i][2],data[i][3],i);
      }
  };

  // Initialize Candlestick Chart
  // チャートの初期化
  // public method
  // $(elm).candleChart([[tickdata]],{options})
  jQuery.fn.candleChart = function(data,options) {
    var elm = this;
    
    // データとオプションの処理
    // 引数が2個なら第2引数をオプションとみなす
    if(arguments.length ===1 && is_array(arguments[0]) ) {
      _setOption({});
    }
    else if(arguments.length ===1 && typeof arguments[0] === "object"){
      _setOption(arguments[0]);
    }
    else if(arguments.length ===2){
      _setOption(arguments[1]);
    }

    //要素を一個ずつ処理
    elm.each(function() {
      if($(this).attr("tagName")==="CANVAS") {
        _init(this);
        if(arguments.length === 2){
          _writeCandles(this,data);
        }
        else if(arguments.length ===1 && is_array(arguments[0])){
          _writeCandles(this,data);
        }
      }
    });

    //method chain
    return this;
  };

  // write Trading volume
  // 出来高の表示
  // public method
  // $(elm).ccVolume([volumedata])
  jQuery.fn.ccVolume = function(data) {
    var elm = this;
    if(!data){ return; }

    // 出来高のバーを一本表示
    var _writeVolumeBar = function(ctx, v, d) {
      ctx.fillStyle = st.voColor;
      ctx.fillRect(
        _ajustXY(d * cdStage + cdOffsetX), _ajustXY( st.height - st.ofY-1) ,
            barWidth, _ajustXY(v) *-1 );
      return v;
    };

    // 出来高の描画
    var _writeVolume = function(canvas,data) {
      var ctx = canvas.getContext('2d');
      var max = Math.max.apply(Math, data );
      var param = 40/ max;      // 40pxが最大の高さ
      var l = data.length;
      for(var i = 0;i < l; i++){
        _writeVolumeBar(ctx, Math.floor(data[i]* param),i);
      }
    };

    //要素を一個ずつ処理
    elm.each(function() {
      if($(this).attr("tagName")==="CANVAS") {
        _writeVolume(this,data);
      }
    });

    //method chain
    return this;
  };

  // write (only) candlestick
  // ローソク足の描画
  // public method
  // $(elm).ccTick([volumedata])
  jQuery.fn.ccTick = function(data) {
    var elm = this;
    if(!data){ return; }

    //要素を一個ずつ処理
    elm.each(function() {
      if($(this).attr("tagName")==="CANVAS") {
        _writeCandles(this,data);
      }
    });

    //method chain
    return this;
  };

  // clear chart
  // チャートの初期化
  // public method
  // $(elm).ccClear()
  jQuery.fn.ccClear = function() {
    var elm = this;

    //要素を一個ずつ処理
    elm.each(function() {
      if($(this).attr("tagName")==="CANVAS") {
        _init(this);
      }
    });

    //method chain
    return this;
  };

})(jQuery);