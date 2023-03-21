// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;

function start() {

    //locateMeInMap(15)
    addParkingMarker()

    getMotorcycleParkingSlot()

    // Smart parking data
    //https://sps-opendata.pilotsmartke.gov.hk/rest/getCarparkInfos?vehicleTypes=motorCycle

    // Roadworks Location Data 
    //https://static.data.gov.hk/td/roadworks-location/dataspec/roadworks_location_data_specification.pdf

}

function getMotorcycleParkingSlot() {

    $.ajax({
        type: 'post',
        url: 'https://www.hkemobility.gov.hk/api/drss/osp/cluster',
        data: JSON.stringify({
            "bounds": {
                "northEast": {
                    "lat": 22.317207415093414,
                    "lng": 114.17477130889894
                },
                "northWest": {
                    "lat": 22.317207415093414,
                    "lng": 114.16249752044679
                },
                "southEast": {
                    "lat": 22.291359801531474,
                    "lng": 114.17477130889894
                },
                "southWest": {
                    "lat": 22.291359801531474,
                    "lng": 114.16249752044679
                }
            },
            "zoomLevel": 15,
            "types": [{
                "vehicleType": "Motorcycles",
                "meterType": "All",
                "vacancyType": "All"
            }]
        }),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function(data) {
            console.log("parking", data)
        }
    });
}

function addParkingMarker() {

    //https://resource.data.one.gov.hk/ogcio/carpark/Parking_Vacancy_Data_Specification.pdf

    $.getJSON('https://api.data.gov.hk/v1/carpark-info-vacancy?data=info&vehicleTypes=motorCycle&lang=zh_TW', function(data) {
        console.log("data", data)

        var parkingDataArray = data.results

        const markers = parkingDataArray.map((parkingData,i)=>{

            const position = {
                lat: parkingData.latitude,
                lng: parkingData.longitude
            }

            const label = parkingData.name
            const marker = new google.maps.Marker({
                position,
                label,
            });

            let info = parkingData.name + "</br>"
            if (parkingData?.renditionUrls?.carpark_photo != null) {
                info += '<img src="' + parkingData?.renditionUrls?.carpark_photo + '" height="100px" width="100px">' + "</br>"
            }
            info += parkingData.displayAddress + "</br>"
            info += "Status: " + parkingData.opening_status + "</br>"
            info += "Phone: " + (parkingData.contactNo == "" ? "N/A" : parkingData.contactNo) + "</br>"
            info += '<a href="' + parkingData.website + '" target="_blank">link</a></br>'

            if (parkingData.motorCycle != null) {

                info += "車位: " + parkingData.motorCycle.space + "</br>"

            }

            // markers can only be keyboard focusable when they have click listeners
            // open info window when marker is clicked
            marker.addListener("click", ()=>{
                infoWindow.setContent(info);
                infoWindow.open(map, marker);
            }
            );
            return marker;
        }
        );

        // Add a marker clusterer to manage the markers.
        new markerClusterer.MarkerClusterer({
            markers,
            map
        });
    });

}

function locateMeInMap(zoomLv) {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position)=>{
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            console.log("Current location: " + pos.lat + ", " + pos.lng)

            infoWindow.setPosition(pos);
            infoWindow.setContent("Location found.");
            infoWindow.open(map);
            map.setCenter(pos);

            map.setZoom(zoomLv)
        }
        , ()=>{
            handleLocationError(true, infoWindow, map.getCenter());
        }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"),{
        center: {
            lat: 22.3087851,
            lng: 114.0462291
        },
        zoom: 11,
    });
    infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
    });

    const locationButton = document.createElement("button");

    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", ()=>{}
    );

    start()
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation.");
    infoWindow.open(map);
}

window.initMap = initMap;
