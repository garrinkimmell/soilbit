  // Map setup.
  var cloudmadeUrl =
    'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png',
       cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18}),
       map = new L.Map('map', {layers: [cloudmade], center: new
                              L.LatLng(38.07431, -95.53953), zoom: 14 });
  var bing =
      new
      L.BingLayer("AjSTqkeByaBnGpw416LPh4Jl6KLcRttFU2nsYHCTbjmsYpiJCbytwTimB4Ogf8Bk",
      "ArialWithLabels");


  var bing_visible = false;
  var toggle_images = function() {
      if (bing_visible) {
          map.removeLayer(bing);
      } else {
          map.addLayer(bing);
      }
      bing_visible = ! bing_visible;
  };

  L.control.layers( {'Roads' : cloudmade }, {'Photo' : bing}).addTo(map);


// The steps for drawing
var controller = {
    state: 'instruction-step',
    nextStep:
      function (self) {
          console.log('Moving to next step' + this.state);
          if (this.state == 'instruction-step') {
              $('#instruction-step').hide();
              $('#name-step').show();
              this.state = 'name-step';
          } else if (this.state == 'name-step') {
              $('#name-step').hide();
              $('#bounds-step').show();
              $('#map').show();
              fieldInfo.name = $('#field-name')[0].value;
              this.state = 'bounds-step';
          } else if (this.state == 'bounds-step') {
              $('#bounds-step').hide();
              $('#grid-step').show();
              gridPoints = makeGrid();
              $('#map').show();
              this.state = 'grid-step';
          }
      },
    init:
      function () {
          this.state = 'instruction-step';
          $('#instruction-step').show();
          $('#name-step').hide();
          $('#bounds-step').hide();
          $('#grid-step').hide();
          $('#map').hide();
     }
};



  // The fieldInfo struct holds properties of the field being defined.
  var fieldInfo = {
      border : [],
      name : "Unknown",

      // FIXME: Make this work for multiple polygons
      getBounds: function () {
          return this.border[0].getBounds();
      },

      getCenter: function () {
          return this.getBounds().getCenter();
      },

      containsPoint: function(point) {
          var coords = this.border[0].getLatLngs();
          var oddNodes = false;
          var y = point.lat;
          var x = point.lng;
          for (var i = 0; i < coords.length; i++) {
              var j = (i + 1) % coords.length;
              if (((coords[i].lat < y && coords[j].lat >= y) ||
                   (coords[j].lat < y && coords[i].lat >= y)) &&
                  (coords[i].lng + (y - coords[i].lat) /
                   (coords[j].lat - coords[i].lat) *
                   (coords[j].lng - coords[i].lng) < x)) {
                  oddNodes = !oddNodes;
              }
          }
          return oddNodes;
      }

  };


  var drawControl = new L.Control.Draw({
                        polygon: {
                                allowIntersection: false,
                                shapeOptions: {
                                        color: '#bada55'
                                }
                        }
                });
  map.addControl(drawControl);
  var drawnItems = new L.LayerGroup();
  map.on('draw:poly-created', function (e) {
      drawnItems.addLayer(e.poly);
      fieldInfo.border.push(e.poly);
  });
  map.addLayer(drawnItems);


  // Clear the Field
  var clearBounds = function () {
      fieldInfo.bounds = [];
      drawnItems.clearLayers();
      };



 var makeGrid = function () {
    var gridSize = 2.5; // 2.5 acre grid.
    // FIXME: Deal with multiple polygons
    center = fieldInfo.getCenter();
    bounds = fieldInfo.getBounds();

    // Distance of 1 degree of lat/lng
    stepY = new L.LatLng(center.lat + 1,center.lng);
    stepX = new L.LatLng(center.lat,center.lng + 1);

    // Get the length of a degree lat/long in meters
    distY = center.distanceTo(stepY);
    distX = center.distanceTo(stepX);

    size = 4046 * 2.5; // (2.5 acres is grid size)
    side = Math.sqrt(size);

    strideY = side / distY;
    strideX = side / distX;


    // Construct the grid points
    var pts = [];
    for (var x = bounds.getSouthWest().lng + 0.00000001;
         x < bounds.getNorthEast().lng; x += strideX) {
      for (var y = bounds.getSouthWest().lat + 0.0000001;
           y < bounds.getNorthEast().lat; y += strideY) {
              pts.push(new L.LatLng(y,x));
         }
     }

     gridPoints = pts
     gridPoints.forEach(function (p) {
         m = L.marker(p, { 'draggable' : true })
         if (! fieldInfo.containsPoint(p) ) {
             m.setOpacity(0.5);
         } else {
             m.setOpacity(1.0);
         }

         m.on('dragend', function (e) {
             console.log('Marker drag end' + e.target.getLatLng());
             if (! fieldInfo.containsPoint(e.target.getLatLng())) {
                 e.target.setOpacity(0.5);
             } else {
                 e.target.setOpacity(1.0);
             }
         });


         gridMarkers.push(m);
         m.addTo(map);
     });


     return pts;
  };


  var gridPoints = [];
  var gridMarkers = [];


  var shiftGrid = function (xdir,ydir) {
      gridMarkers.forEach(function (m) {
          p = m.getLatLng();
          p.lat += ydir;
          p.lng += xdir;
          if (! fieldInfo.containsPoint(p) ) {
              m.setOpacity(0.5);
          } else {
              m.setOpacity(1.0);
          }
          m.update();
      });
  };



 /*

 momwest = drawnItems._layers['60']



 getinfo = function(layer) {
    center = layer.getBounds().getCenter();
    stepY = new L.LatLng(center.lat + 1,center.lng);
    stepX = new L.LatLng(center.lat,center.lng + 1);
    distY = center.distanceTo(stepY);
    distX = center.distanceTo(stepX);

    // 1 acres is 4046 square meters
    size = 4046 * 2.5; // (2.5 acres is grid size)
    side = Math.sqrt(size);

    strideY = side / distY;
    strideX = side / distX;
 }


 // Adapted from http://code.google.com/p/geojs/source/browse/trunk/src/path.js
 containsPoint = function(coords,point) {
   var oddNodes = false;
   var y = point.lat;
   var x = point.lng;
   for (var i = 0; i < coords.length; i++) {
     var j = (i + 1) % coords.length;
     if (((coords[i].lat < y && coords[j].lat >= y) ||
          (coords[j].lat < y && coords[i].lat >= y)) &&
         (coords[i].lng + (y - coords[i].lat) /
             (coords[j].lat - coords[i].lat) *
             (coords[j].lng - coords[i].lng) < x)) {
       oddNodes = !oddNodes;
     }
   }

   return oddNodes;
 };



 gengrid = function (layer) {
   var bounds = layer.getBounds();
   var pts = [];
   for (var x = bounds.getSouthWest().lng + 0.00000001; x < bounds.getNorthEast().lng; x += strideX) {
     for (var y = bounds.getSouthWest().lat + 0.0000001; y < bounds.getNorthEast().lat; y += strideY) {
         pt = new L.LatLng(y,x)
         if (containsPoint(layer.getLatLngs(),pt)) {
            pts.push(new L.LatLng(y,x));
         }
     }
   }
   return pts;
 }








 */
