
var geocoder;
var markers = [];
var lastVertex = 1;
var lengthInMeters;
var delayer;
var index  = -1;
var image = ['img/delivery-logistics-renault-vehicle-front-truck-icon.png',
             'http://www.iconsplace.com/icons/preview/purple/truck-32.png',
             'http://www.iconsplace.com/icons/preview/pink/truck-32.png',
            ]
var Colors = ["#FF0000", "#00FF00", "#0000FF"];
infowindow = null;
function initMap() {
      infowindow = new google.maps.InfoWindow(
    { 
      size: new google.maps.Size(150,50)
    });
        geocoder = new google.maps.Geocoder();
        myOptions = {
            zoom: 5,
            center: {lat: 22.946557, lng: 79.194353},
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById('map'), myOptions),
        // Instantiate a directions service.
        directionsService = new google.maps.DirectionsService;
          document.getElementById('submit').addEventListener('click', function() {
    calculateAndDisplayRoute(directionsService);
  });
}

function createMarker(latlng, label, html) {
// alert("createMarker("+latlng+","+label+","+html+","+color+")");
    var contentString = '<b>'+label+'</b><br>'+html;
    
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5,
        icon: image[index]
        });
        marker.myname = label;


    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString); 
        infowindow.open(map,marker);
        });
    return marker;
}  
function calculateAndDisplayRoute(directionsService) {
  var waypts = [];
  var checkboxArray = document.getElementById('waypoints');
  for (var i = 0; i < checkboxArray.length; i++) {
    if (checkboxArray.options[i].selected) {
      waypts.push({
        location: checkboxArray[i].value,
        stopover: true
      });
    }
  }

  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: 'DRIVING'
  }, function(response, status) {
    if (status === 'OK') {
        var rendererOptions = {
        map: map,
        suppressMarkers : true,
        preserveViewport: true
    }  
        disp = new google.maps.DirectionsRenderer(rendererOptions);     
        disp.setMap(map);
        disp.setDirections(response);
      var bounds = new google.maps.LatLngBounds();
      var route = response.routes[0];
     index++;
        
        
    // -----------------------------------------------------------------------------------------
        startLocation = new Object();
        endLocation = new Object();
        
        
        
            poly = new google.maps.Polyline({
            path: [],
            strokeColor: Colors[index],
            strokeWeight: 3
            });
        
      //path and legs
        var path = response.routes[0].overview_path;
        var legs = response.routes[0].legs;
    

        //markers
        for (i=0;i<legs.length;i++) {
              if (i == 0) { 
                startLocation.latlng = legs[i].start_location;
                startLocation.address = legs[i].start_address;
                marker = createMarker(legs[i].start_location,"start",legs[i].start_address,Colors[index]);
              }
              endLocation.latlng = legs[i].end_location;
              endLocation.address = legs[i].end_address;
              var steps = legs[i].steps;

              for (j=0;j<steps.length;j++) {
                var nextSegment = steps[j].path;                
                var nextSegment = steps[j].path;

                for (k=0;k<nextSegment.length;k++) {
                    poly.getPath().push(nextSegment[k]);
                }

              }
            }
        poly.setMap(map);
        lengthInMeters = google.maps.geometry.spherical.computeLength(poly.getPath());
        map.setCenter(poly.getPath().getAt(0));
        poly2 = new google.maps.Polyline({path: [poly.getPath().getAt(0)], strokeColor:Colors[index], strokeWeight:3});
        if (delayer) clearTimeout(delayer);
        delayer = setTimeout(animate(lengthInMeters*0.001),2000);        
        
      var summaryPanel = document.getElementById('directions-panel');
      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
            '</b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
  function updatePoly(dist){
 // Spawn a new polyline every 20 vertices, because updating a 100-vertex poly is too slow
    if (poly2.getPath().getLength() > 20) {
          poly2=new google.maps.Polyline([poly.getPath().getAt(lastVertex-1)]);
          // map.addOverlay(poly2)
        }

    if (poly.GetIndexAtDistance(dist) < lastVertex+2) {
        if (poly2.getPath().getLength()>1) {
            poly2.getPath().removeAt(poly2.getPath().getLength()-1)
        }
            poly2.getPath().insertAt(poly2.getPath().getLength(),poly.GetPointAtDistance(dist));
    } else {
        poly2.getPath().insertAt(poly2.getPath().getLength(),endLocation.latlng);
    }
     
  }
function animate(d) {
   if (d>lengthInMeters) {
      marker.setPosition(endLocation.latlng);
      return;
   }
    var p = poly.GetPointAtDistance(d);
    marker.setPosition(p);
    updatePoly(d);
    delayer = setTimeout("animate("+(d+lengthInMeters*0.001)+")", 100);
}
        
