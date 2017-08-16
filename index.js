function initMap() {

  var hongkongBounds = [];
  hongkongBounds.push(new google.maps.LatLng(22.297315896925156, 114.11087036132812));
  hongkongBounds.push(new google.maps.LatLng(22.29668059217866, 114.15000915527344));
  hongkongBounds.push(new google.maps.LatLng(22.286832999263584, 114.1754150390625));
  hongkongBounds.push(new google.maps.LatLng(22.299539440788873, 114.20150756835938));
  hongkongBounds.push(new google.maps.LatLng(22.301762949263182, 114.21043395996094));
  hongkongBounds.push(new google.maps.LatLng(22.271901454569353, 114.26261901855469));
  hongkongBounds.push(new google.maps.LatLng(22.24521132030011, 114.26227569580078));
  hongkongBounds.push(new google.maps.LatLng(22.191497906468058, 114.30828094482422));
  hongkongBounds.push(new google.maps.LatLng(22.191497906468058, 114.20047760009766));
  hongkongBounds.push(new google.maps.LatLng(22.228050690678586, 114.1537857055664));
  hongkongBounds.push(new google.maps.LatLng(22.26141665157504, 114.11052703857422));
  hongkongBounds.push(new google.maps.LatLng(22.27984396405021, 114.11087036132812));

  var hongKong = new google.maps.LatLng(22.265229398103163, 114.18708801269531);

  var element = document.getElementById("map");
  var map = new google.maps.Map(element, {
    center: hongKong,
    zoom: 3
  });

  //Define OSM map type pointing at the OpenStreetMap tile server
  var imageMapType = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {

      var tilesPerGlobe = 1 << zoom;
      var x = coord.x % tilesPerGlobe;
      if (x < 0) {
        x = tilesPerGlobe + x;
      }

      var hkTileCoords = getTileHongKongCoordinates(zoom, hongKong);
      var input = { x: x, y: coord.y };
      var distance = getDistance(input, hkTileCoords);
      var inside = false;
      var maxDistance = 0;

      if(zoom >= 10) {
        maxDistance = 1;
      }
      if(zoom >= 12) {
        inside = isPointInsidePolygon(hongkongBounds, input, zoom);
        maxDistance = 1.5;
      }
      
      if (distance <= maxDistance || inside) {
        console.log(`Input X: ${input.x}, Y: ${input.y}, Distance: ${distance}, isInside: ${inside}, Zoom: ${zoom}`);
        return "http://tile.openstreetmap.org/" + zoom + "/" + input.x + "/" + input.y + ".png";
      }

      return null;
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OpenStreetMap",
    maxZoom: 18
  });

  map.overlayMapTypes.push(imageMapType);

}

var TILE_SIZE = 256;

function getTileHongKongCoordinates(zoom, latLng) {
  var scale = 1 << zoom;
  var worldCoordinate = project(latLng);
  var tileCoordinate = new google.maps.Point(
    Math.floor(worldCoordinate.x * scale / TILE_SIZE),
    Math.floor(worldCoordinate.y * scale / TILE_SIZE));
  return tileCoordinate;
}

// The mapping between latitude, longitude and pixels is defined by the web
// mercator projection.
function project(latLng) {
  var siny = Math.sin(latLng.lat() * Math.PI / 180);

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  siny = Math.min(Math.max(siny, -0.9999), 0.9999);

  return new google.maps.Point(
    TILE_SIZE * (0.5 + latLng.lng() / 360),
    TILE_SIZE * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
}

function isTileWithInBounds(tile, hongkongBounds, zoom) {
  for (var bound of hongkongBounds) {
    var hongkongTile = getTileHongKongCoordinates(bound, zoom);
    if (hongkongTile.x === tile.x && hongkongTile.y === tile.y) {
      return true;
    }
  }
  return false;
}

function getDistance(pointA, pointB) {
  if (pointA.x >= pointB.x) {
    let temp = pointB
    pointB = pointA;
    pointA = temp;
  }
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function inside(vs, point) {
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

  var x = point[0],
    y = point[1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];

    var intersect = ((yi > y) != (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function isPointInsidePolygon(polygon, point, zoom) {
  return inside(polygon.map(getTileHongKongCoordinates.bind(null, zoom)).map(pointToArray), pointToArray(point));
}

function pointToArray(point) {
  return [point.x, point.y];
}