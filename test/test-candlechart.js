// jqCandlechart test

module("Loading");
test("jQuery plugin:Candlestick Chart", function () {
  equals(typeof jQuery,"function", "jQuery読み込み");
  equals(typeof jQuery("#cc1").candleChart,"function", "jQuery(obj).candleChart プラグイン読み込み");
  equals(typeof jQuery("#cc1").ccVolume,"function", "jQuery(obj).ccVolume 出来高表示機能");
  equals(typeof jQuery("#cc1").ccTick,"function", "jQuery(obj).ccTick ローソク足表示機能");
  equals(typeof jQuery("#cc1").ccMA,"function", "jQuery(obj).ccMA 移動平均線表示機能");
  equals(typeof jQuery("#cc1").ccClear,"function", "jQuery(obj).ccClear 表示クリア機能");
  equals(typeof jQuery("#cc1").ccStatus,"function", "jQuery(obj).ccStatus 現在の設定を取得");
});

module("Options");
test("Options", function () {
  var op = {
      'width' : 600,
      'height' : 400,
      'ofX': 40,
      'ofY': 30,
      'bgColor': "#2F4F4F",
      'cdWidth': 5,
      'cdLineColor': "#FFF",
      'cdUpColor': "#FF4500",
      'cdDownColor': "#00CED1",
      'voColor': "#E0FFFF",
      'liColor': "#008080",
      'maColor': "#FFE",
      'liNum': 6,
      'upper' : 15000,
      'lower' : 7000,
      'autoScale' : true
  };

  var stat = $("#cc1").candleChart([[100,200,210,90]],op).ccStatus();
  equals(typeof stat,"object", "オプションを設定し、ステータス値として取得");
  equals(stat.options.width ,600, "Canvasの幅を600に設定");
  equals(stat.options.height ,400, "Canvasの幅を400に設定");
  equals(stat.options.ofX ,40, "Canvas内の横の余白を40に設定");
  equals(stat.options.ofY ,30, "Canvas内の縦の余白を30に設定");
  equals(stat.options.bgColor ,"#2F4F4F", "背景色を#2F4F4Fに設定");
  equals(stat.options.cdWidth ,5, "ローソクの幅を5に設定");
  equals(stat.options.cdLineColor ,"#FFF", "ローソクの枠線色を#FFFに設定");
  equals(stat.options.cdUpColor ,"#FF4500", "値上色を#FF4500に設定");
  equals(stat.options.cdDownColor ,"#00CED1", "値上色を#00CED1に設定");
  equals(stat.options.voColor ,"#E0FFFF", "出来高色を#E0FFFFに設定");
  equals(stat.options.liColor ,"#008080", "罫線色を#008080に設定");
  equals(stat.options.maColor ,"#FFE", "移動平均線の色を#FFEに設定");
  equals(stat.options.liNum ,6 , "横罫線数を6に設定");
  equals(stat.options.upper ,15000 , "表の上限値を15000に設定");
  equals(stat.options.lower ,7000 , "表の下限値を7000に設定");
  equals(stat.options.autoScale ,true , "表の上限と下限値を自動設定に設定");
});

