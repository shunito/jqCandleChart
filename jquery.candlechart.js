/*
 * jQuery plugin : Candlestick Chart v0.1.3
 * http://github.com/shunito/jqCandleChart
 *
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

  // JavaScript:The Good Parts
  var is_array = function(value) {
    return
      value && 
      typeof value === "object" &&
      typeof value.length === "number" &&
      typeof value.splice === "function" &&
      !(value.propertyIsEnumerable('length'));  
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
      'maColor': "#00F",
      'liNum': 5,
      'upper' : 250,
      'lower' : 0,
      'autoScale' : false
      }, options);

    // 座標スケールの変換準備（縦表示領域とスケールの比を求める）
    chHeight = st.height - st.ofY*2;
    param = chHeight / (st.upper  - st.lower);

    // ローソクの幅から芯や出来高の幅、間隔を計算
    shinWidth = Math.floor(st.cdWidth /3);
    cdStage = st.cdWidth*2;
    cdOffsetX = st.ofX + cdStage;
    shinOffsetX = cdOffsetX + (st.cdWidth/2);
    barWidth = st.cdWidth;
  };

  // 横罫線の描画
  var _writeScale = function(ctx) {
  
    // 罫線の幅を計算
    // 上限、下限の幅を罫線数で割る
    var p = Math.floor((st.upper-st.lower)/st.liNum);

  	// Font Setting
    ctx.textAlign ="right";
    ctx.textBaseline ="middle";
    ctx.font = "normal 100 10px/2 Unknown Font, sans-serif";
    
    var l = st.liNum;
    for(var i =1; i <= l; i++) {
      ctx.beginPath();
      ctx.strokeStyle = st.liColor;
      var y = _ajustXY( st.height - ( p * i * param ) - st.ofY );
      ctx.moveTo( _ajustXY(st.ofX+1) , y );
      ctx.lineTo( _ajustXY(st.width-st.ofX) , y );
      ctx.stroke();

      // 罫線部分の値
      ctx.beginPath();
      ctx.strokeStyle = st.cdLineColor;
      ctx.strokeText( p*i + st.lower, st.ofX - 4, y, st.ofX);
    }
  };

  // <canvas>の初期化
  var _init = function (canvas) {
    var ctx = canvas.getContext('2d');
    jQuery(canvas).css("width", st.width + "px");
    jQuery(canvas).css("height", st.height + "px");
    jQuery(canvas).attr("width", st.width);
    jQuery(canvas).attr("height", st.height);

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

  // 縦罫線
  var _writeTimeScale = function(ctx, label, d) {
  
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = st.liColor;
    
    // 破線（4px）
    var x = _ajustXY(d * cdStage + shinOffsetX);
    var y = st.height - st.ofY-1;
    while( y > st.ofY ) {
      ctx.beginPath();
      ctx.moveTo( x , _ajustXY( y ));
      ctx.lineTo( x , _ajustXY( y - 4 ));
      ctx.stroke();
      y = y-8;
    }

    // 罫線部分の値
    ctx.beginPath();
    ctx.strokeStyle = st.cdLineColor;
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.strokeText( label, x , st.height - st.ofY +4 );
  
  };

  // ローソク一本描く
  var _writeCandle = function(ctx,s,e,h,l,d) {
      var stP = (s - st.lower) * param; // 初値
      var enP = (e - st.lower) * param; // 終値
      var hiP = (h - st.lower) * param; // 高値
      var loP = (l - st.lower) * param; // 安値

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
        if(data[i]) {
          if(data[i][4]) {
           _writeTimeScale(ctx, data[i][4],i);
          }
          _writeCandle(ctx,data[i][0],data[i][1],data[i][2],data[i][3],i);
        }
      }
  };

  // スプライン補間で移動平均線の描画
  // from: jQuery.crSpline Copyright 2010, M. Ian Graham
  // http://github.com/MmmCurry/jquery.crSpline
  var _writeMovingAvg = function(canvas,data,color) {
    var ctx = canvas.getContext('2d');

    var l= data.length;
    var dotsPerSeg = cdStage/2;
    var points = [];
    var res = {};
    var seq = [];
    var numSegments;
    var px,py;

    // Catmull-Rom interpolation between p0 and p1 for previous point p_1 and later point p2
    // http://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull.E2.80.93Rom_spline
    var interpolate = function (t, p_1, p0, p1, p2) {
      return Math.floor((t * ((2 - t) * t - 1) * p_1 +
        (t * t * (3 * t - 5) + 2) * p0 +
        t * ((4 - 3 * t) * t + 1) * p1 +
        (t - 1) * t * t * p2
        ) / 2);
    };

    // Extend this p1,p2 sequence linearly to a new p3
    var generateExtension = function (p1, p2) {
      return [
        p2[0] + (p2[0] - p1[0]),
        p2[1] + (p2[1] - p1[1])
      ];
    };

    var spline = function(t) {
      var segNum = Math.floor(t * numSegments);
      if (segNum === numSegments) {
        return {
          x: seq[seq.length-2][0],
          y: seq[seq.length-2][1]
        };
      }
      var microT = (t - segNum/numSegments) * numSegments;
      var x = interpolate(microT,
        seq[segNum][0],
        seq[segNum+1][0],
        seq[segNum+2][0],
        seq[segNum+3][0]);
      var y = interpolate(microT,
        seq[segNum][1],
        seq[segNum+1][1],
        seq[segNum+2][1],
        seq[segNum+3][1]);

      return {
        x: x,
        y: y
      };
    };

    for(var i=0; i< l; i++) {
      px = i* cdStage+ shinOffsetX;
      py = Math.floor( chHeight - data[i]* param) + st.ofY;
      points.push([px,py]);
    }

    // Generate the first p_1 so the caller doesn't need to provide it
    seq.push(generateExtension(points[1], points[0]));
    seq = seq.concat(points);
    // Generate the last p2 so the caller doesn't need to provide it
    seq.push(generateExtension(seq[seq.length-2], seq[seq.length-1]));

    numSegments = seq.length - 3;
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = color ? color : st.maColor;
    ctx.beginPath();
    var pos= spline(0);
    ctx.moveTo(pos.x,pos.y);

    for(var i=0; i< l; i++) {
      for(var j=0; j< dotsPerSeg; j++){
        var t = (i + j/dotsPerSeg) / l;
        var pos = spline(t);
        ctx.lineTo(pos.x, pos.y);
      }
    }
    ctx.stroke();
  };

  // 下限・上限の自動設定
  var _setScale = function(data) {
    var l = data.length;
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;

    for(var i=0; i<l ; i++) {
      max = Math.max(max,data[i][2]);
      min = Math.min(min,data[i][3]);
    }

    // 上限・下限の差の1/5を余裕として上下を調整
    var s = (max - min) / 5;
    max = Math.floor( (max + s) / 10) * 10;
    min = Math.floor( (min - s) / 10) * 10;

    // パラメータ再設定
    st.upper = max;
    st.lower = min;
    param = chHeight / (st.upper  - st.lower);
  };

  // Initialize Candlestick Chart
  // チャートの初期化
  // public method
  // Usage: jQuery(elm).candleChart([[tickdata]],{options})
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

    // 上限・下限の自動設定
    if(st.autoScale && data) {
      _setScale(data);
    }

    //要素を一個ずつ処理
    elm.each(function() {
      if(jQuery(this).attr("tagName")==="CANVAS") {
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
  // Usage: jQuery(elm).ccVolume([volumedata])
  jQuery.fn.ccVolume = function(data) {
    var elm = this;
    if(!data){ return this; }

    // 出来高のバーを一本表示
    var _writeVolumeBar = function(ctx, v, d) {
      var v = v || 0;
      ctx.fillStyle = st.voColor;
      ctx.fillRect(
        _ajustXY(d * cdStage + cdOffsetX), _ajustXY( st.height - st.ofY-1) ,
            barWidth, _ajustXY(v) *-1 );
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
      if(jQuery(this).attr("tagName")==="CANVAS") {
        _writeVolume(this,data);
      }
    });

    //method chain
    return this;
  };

  // write (only) candlestick
  // ローソク足の描画
  // public method
  // Usage: jQuery(elm).ccTick([volumedata])
  jQuery.fn.ccTick = function(data) {
    var elm = this;
    if(!data){ return this; }

    // 上限・下限の自動設定
    if(st.autoScale) {
      _setScale(data);
    }

    //要素を一個ずつ処理
    elm.each(function() {
      if(jQuery(this).attr("tagName")==="CANVAS") {
        _writeCandles(this,data);
      }
    });

    //method chain
    return this;
  };

  // write moving average
  // 移動平均線の表示
  // use jquery crSpline
  //   http://github.com/MmmCurry/jquery.crSpline
  //   fork -> http://github.com/shunito/jquery.crSpline
  // public method
  // Usage: jQuery(elm).ccMA([volumedata],linecolor)
  jQuery.fn.ccMA = function(data,color) {
    var elm = this;
    if(!data){ return this; }

    //要素を一個ずつ処理
    elm.each(function() {
      if(jQuery(this).attr("tagName")==="CANVAS") {
        _writeMovingAvg(this,data,color);
      }
    });

    //method chain
    return this;
  };

  // clear chart
  // チャートの画面クリア
  // public method
  // Usage: jQuery(elm).ccClear()
  jQuery.fn.ccClear = function() {
    var elm = this;

    //要素を一個ずつ処理
    elm.each(function() {
      if(jQuery(this).attr("tagName")==="CANVAS") {
        _init(this);
      }
    });

    //method chain
    return this;
  };

})(jQuery);