// jqCandlechart test

module("Loading");
test("jQuery plugin:Candlestick Chart", function () {
  equals(typeof jQuery,"function", "jQuery読み込み");
  equals(typeof jQuery("#cc1").candleChart,"function", "jqCandlechartプラグイン読み込み");
  equals(typeof jQuery("#cc1").ccVolume,"function", "出来高表示機能");
  equals(typeof jQuery("#cc1").ccTick,"function", "ローソク足表示機能");
  equals(typeof jQuery("#cc1").ccMA,"function", "移動平均線表示機能");
  equals(typeof jQuery("#cc1").ccClear,"function", "表示クリア機能");
  equals(typeof jQuery("#cc1").ccStatus,"function", "現在の設定を取得");
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
      'liNum': 5,
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

  
});

