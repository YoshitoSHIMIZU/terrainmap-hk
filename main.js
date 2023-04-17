// MapLibre GL JSの読み込み
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

//opacityプラグイン読み込み
import OpacityControl from 'maplibre-gl-opacity';
import 'maplibre-gl-opacity/dist/maplibre-gl-opacity.css';

//地理院標高タイルをmaplibre GL JSで利用するためのモジュール
import { useGsiTerrainSource } from 'maplibre-gl-gsi-terrain';

const map = new maplibregl.Map({
  container: 'map', // div要素のid
  zoom: 9, // 初期表示のズーム
  center: [141.6795, 43.0635], // 初期表示の中心
  minZoom: 5, // 最小ズーム
  maxZoom: 18, // 最大ズーム
  maxBounds: [122, 20, 154, 50], // 表示可能な範囲
  style: {
      version: 8,
      sources: {
          // 背景地図ソース
/*           osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              maxzoom: 19,
              tileSize: 256,
              attribution:
                  '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }, */

        mierune: {
          type: 'raster',
          tiles: ['https://api.maptiler.com/maps/jp-mierune-gray/{z}/{x}/{y}.png?key=IP9CYAWJVLGwdbFbpPVD'],
          maxzoom: 19,
          tileSize: 256,
          attribution:
              '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },

        //アンカレジパーク投影
        anchorage: {
          type: 'image',
          url: './20220499-01-ankarejipark-s.jpg',
          coordinates: [
            [141.660790470, 42.825100608],
            [141.67496204, 42.82680712],
            [141.6770271, 42.8192833],
            [141.6628374, 42.8175565],
          ],
        },
/*           [15769606.94,5285387.34],
        [15771184.290,5285647.030],
        [15771413.214,5284504.212],
        [15769835.545,5284244.972],  */
              
/*           //航空写真ここから
        aerial: {
          type: 'raster',
          tiles: [
            'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'
          ],
          minzoom: 2,
          maxzoom: 17,
          tileSize: 256,
          attribution:
          '<a href="https://cyberjapandata.gsi.go.jp/development/ichiran.html#relief">地理院タイル一覧</a>',
        }, */
        //航空写真ここまで
     },
      layers: [
        //背景地図レイヤー
        {
          id: 'osm-layer',
          source: 'mierune',
          type: 'raster',
          //paint: {"raster-opacity": 0.5},
        },

        //アンカレジパーク追加
        {
          id: 'anchorage-map',
          source: 'anchorage',
          type: 'raster',
          paint: {
           'raster-opacity': 0.7,
          },
        },

        /* //陰影起伏図ここから
        {
          id: 'inei-layer',
          source: 'inei',
          type: 'raster',
          paint: {"raster-opacity": 0.1},
          /* layout: {visibility: 'none'},//初期読み込まない 
        },
        //航空写真ここから
        /* {
          id: 'aerial-layer',
          source: 'aerial',
          type: 'raster',
          layout: {visibility: 'none'},//初期読み込まない
        }, */

      ]
    }
});


/* // マップの初期ロード完了時に発火するイベントを定義
map.on('load', () => {
  // 背景地図・重ねるタイル地図のコントロール
  const opacity = new OpacityControl({
      baseLayers: {
          'osm-layer': 'オープンストリートマップ', 
          'inei-layer': '陰影起伏図',
          'aerial-layer': '航空写真',
      },
  });
  map.addControl(opacity, 'top-left');//左上
}); */

//陰影図
map.on('load', () => {
  //地形データ生成（標高タイル）
  const gsiTerrainSource = useGsiTerrainSource(maplibregl.addProtocol);
  //地形データ追加
  map.addSource('terrain', gsiTerrainSource);

  //陰影図追加
  map.addLayer(
    {
      id: 'hillshade',
      source: 'terrain', //type=raster-demのsourceを指定
      type: 'hillshade', //陰影図レイヤー
      paint: {
        'hillshade-illumination-anchor': 'map', //陰影方向の基準
        'hillshade-exaggeration': 0.2 //濃さ
      },
    },    
  );

    //3D地形
  map.addControl(
    new maplibregl.TerrainControl({
      source: 'terrain', //type="raster-dem"のsourceのID
      exaggeration:2, //何倍で強調？
    }),
  );
});

//ポイント追加
map.on('load', function(){
  // ポイントのデータソース設定
  map.addSource('point_poi', {
    type: 'geojson',
    data: "./terrain-hk-v1-1.geojson"
  });
      // ポイントのデータソース設定
  map.addLayer({
    "id": "point_poi",
    "type": "circle",
    "source": "point_poi",
    "layout": {},
    "paint": {
      "circle-radius": 6,
      "circle-opacity": 0.8,
      "circle-color": [
        'interpolate',
        ['linear'],
        ['get', 'Type'],
        1, '#008000', //フォレストは緑
        2, '#FFC20E', //スプリントは肌色系
        //"#ff4500",
      ],
    },
  });

/*   map.addSource("my-route", {
    "type":"geojson",
    "data": "public/gps_yote.geojson" // <= add data here!
  });

  map.addLayer({
    id: 'my-route-layer',
    source: 'my-route',
    type: 'line',
    layout: {
      'line-cap': "round",
      'line-join': "round"
    },
    paint: {
      'line-color': "#008080",
      'line-width': 4
    }
  }) */
})

 // 地図上をクリックした際のイベント
 map.on('click', (e) => {
  // クリック箇所にポイントレイヤーが存在するかどうかをチェック
  const features = map.queryRenderedFeatures(e.point, {
      layers: [
          'point_poi',
      ],
  });
  if (features.length === 0) return; // 地物がなければ処理を終了

  // 地物があればポップアップを表示する
  const feature = features[0]; // 複数の地物が見つかっている場合は最初の要素を用いる
  const popup = new maplibregl.Popup()
      .setLngLat(feature.geometry.coordinates) // [lon, lat]
      // 名称・説明を表示するよう、HTMLを文字列でセット
      .setHTML(
          `\
  <div style="font-weight:900; font-size: 1.2rem;">${
      feature.properties.Name
  }</div>\
  <div>${feature.properties.guide}</div>`
      )
      .setMaxWidth('400px')
      .addTo(map);
});