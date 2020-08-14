function initMap(center) {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: center.lat, lng: center.lng },
        zoom: 10
    });
    const directionsService = new google.maps.DirectionsService();
    map.directionsService = directionsService
    const infowindow = new google.maps.InfoWindow()
    map.infowindow = infowindow
    return map
}

function pairwise(arr, func) {
    for (let i = 0; i < arr.length - 1; i++) {
        func(arr[i], arr[i + 1])
    }
}

class Node {
    constructor(name, lat, lng) {
        this.name = name
        this.lat = lat
        this.lng = lng
    }
    draw(map) {
        const infowindow = map.infowindow
        let position = new google.maps.LatLng(this.lat, this.lng);

        let marker = new google.maps.Marker({
            position: position,
            title: this.name,
            map: map
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(this.name);
            infowindow.open(map, marker);
        }.bind(this));
    }
}

class Path {
    constructor(map, nodes = [], info = {}) {
        this.map = map
        this.nodes = nodes
        this.info = info
        this.clickHandler = (event) => {
            this._draw_info(event.latLng.lat(), event.latLng.lng())
        }
    }

    drawCrowFlight() {
        let path = this._calculatePath()
        google.maps.event.addListener(path, 'click', this.clickHandler.bind(this))
        path.setMap(this.map)
    }

    drawDirections() {
        this._calculateDirections()
    }

    drawNodes() {
        this.nodes.map((node) => {
            node.draw(this.map)
        })
    }

    //Private methods
    _draw_info(lat, lng) {
        this.map.infowindow.setContent(this.info.test)
        this.map.infowindow.setPosition(new google.maps.LatLng(lat, lng))
        this.map.infowindow.open(this.map)
    }
    _calculatePath() {
        const coords = this.nodes.map((node) => { return { lat: node.lat, lng: node.lng } })
        return new google.maps.Polyline({
            path: coords,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 4,
        })
    }
    _calculateDirections() {
        pairwise(this.nodes, (from, to) => {
            this._calculateSingleDirection(from, to)
        })
    }
    _calculateSingleDirection(from, to) {
        let start = new google.maps.LatLng(from.lat, from.lng);
        let end = new google.maps.LatLng(to.lat, to.lng);
        let request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.BICYCLING
        };
        this.map.directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                const directionsDisplay = new google.maps.DirectionsRenderer({
                    suppressBicyclingLayer: true,
                    suppressMarkers: true,
                    preserveViewport: false
                });
                directionsDisplay.setDirections(response);
                directionsDisplay.setMap(this.map);
                google.maps.event.addListener(directionsDisplay, 'click', (event) => { console.log(event) })
            } else {
                alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
            }
        }.bind(this));
    }
}

function main() {
    const gent = new Node('Gent', 51.053822, 3.722270)
    const hasselt = new Node('Hasselt', 50.929730, 5.338230)
    const brussel = new Node('Brussel', 50.845540, 4.355710)
    const aarschot = new Node('Aarschot', 50.985996, 4.836522)
    const nodes = [hasselt, aarschot, brussel, gent]
    const map = initMap(brussel)
    const path = new Path(map, nodes, info = { test: "het werkt voor paths!" })

    path.drawCrowFlight()
    path.drawDirections()
    path.drawNodes()
}
document.addEventListener("DOMContentLoaded", main)


