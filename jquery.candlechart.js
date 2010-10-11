(function(jQuery) {

  jQuery.fn.candleChart = function(options) {
    var elm = this;
    if(! elm) { return this; }

    //デフォルト設定
    var settings = $.extend({
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
    var chHeight = settings.height - settings.ofY*2;
    var param = chHeight / settings.scale;

    // ローソクの幅から芯や出来高の幅、間隔を計算
    var shinWidth = Math.floor(settings.cdWidth /3);
    var cdStage = settings.cdWidth*2;
    var cdOffsetX = settings.ofX + cdStage;
    var shinOffsetX = cdOffsetX + (settings.cdWidth/2);
    var barWidth = settings.cdWidth;

    // 線をシャープに（なんかもっとうまい手はないかなぁ。）
    var _ajustXY = function( p ) {
      if( p%2 === 0 ) { return ( p - 0.5 ); }
      return p;
    };

    // ローソク一本描く
    var _writeCandle = function(ctx,s,e,h,l,d) {
      var st = settings;
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

    // 横罫線の描画
    var _writeScale = function(ctx) {
      var st = settings;
      
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
//      ctx.font="8px sans-serif";
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
      
    }

    // <canvas>の初期化
    var _init = function (canvas) {
      var st = settings;
      $(canvas).css("width", st.width + "px");
      $(canvas).css("height", st.height + "px");
      $(canvas).attr("width", st.width);
      $(canvas).attr("height", st.height);
      
      // 背景塗りつぶし
      var ctx = canvas.getContext('2d');
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
    
    // 出来高のバーを一本表示
    var _writeVolumeBar = function(ctx, v, d) {
      var st = settings;
      ctx.fillStyle = st.voColor;
      ctx.fillRect(
        _ajustXY(d * cdStage + cdOffsetX), _ajustXY( st.height - st.ofY-1) ,
            barWidth, _ajustXY(v) *-1 );
      return v;
    }    

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

    // 出来高データのセット
    this.ccVolume = function(data) {
      if(!data){ return; }
      elm.each(function() {
        _writeVolume(this,data);
      });
      return elm;
    };

    // ティックデータのセット
    this.ccTick = function(data) {
      if(!data){ return; }
      elm.each(function() {
        _writeCandles(this,data);
      });
      return elm;
    };
    
    // 画面クリア
    this.ccClear = function() {
      elm.each(function() {
        _init(this);
      });
      return elm;
    }

    //要素を一個ずつ処理
    elm.each(function() {
      _init(this);
    });
    
    //method chain
    return this;
  };

})(jQuery);