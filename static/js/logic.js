var ATTRIBUTION = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
var URL_TEMPLATE = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
var M_SATELLITE = L.tileLayer(URL_TEMPLATE, { attribution: ATTRIBUTION, maxZoom: 18, id: 'mapbox/satellite-v9', accessToken: API_KEY});
var M_GRAYSCALE = L.tileLayer(URL_TEMPLATE, { attribution: ATTRIBUTION, maxZoom: 18, id: 'mapbox/light-v10', accessToken: API_KEY});
var M_OUTDOORS = L.tileLayer(URL_TEMPLATE, { attribution: ATTRIBUTION, maxZoom: 18, id: 'mapbox/outdoors-v11', accessToken: API_KEY});
var COLORS = ["#fffb00","#ffdc00", "#ffbd00","#ffa200", "#ff9700", "#ff7800", "#ff5100", "#ff3200", "#ff0000"];
var PLATES_GEOJSON = "static/js/PB2002_plates.json";
var QUERY_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var BASE_MAPS = {"Satellite": M_SATELLITE, "GrayScale": M_GRAYSCALE, "Outdoors": M_OUTDOORS};
var MY_MAP = L.map("map", {center: [37.09, -95.71], zoom: 5, layers:[M_SATELLITE, M_GRAYSCALE, M_OUTDOORS]});

//-----------------------------------------------------------------------------------------------------------------------------------------------
function getColor(m){
    switch(true){
        case m < 8:
            return COLORS[Math.floor(m)];
        default:
            return COLORS[8];
    }
}
function getRadius(m){
    return m * 3.6
}

function getEarthquakes(earthquakeData) {

    var earthquakes = L.geoJSON(earthquakeData, {
        
        pointToLayer:(feature, coords) =>  L.circleMarker(coords),
        
         style: (feature) => {return {opacity: 1, fillOpacity: 1, 
                                    fillColor: getColor(feature.properties.mag),
                                    radius: getRadius(feature.properties.mag),
                                    stroke: true, weight: 0.5}},

        onEachFeature:(feature, layer) => {layer.bindPopup(`<h3>${feature.properties.place }</h3><hr><p> 
                                            ${new Date(feature.properties.time)} </br>Magnitude 
                                            <strong>: ${feature.properties.mag} </strong></p> `);}   
    
    }); 

    return earthquakes;
  }

  function getPlates(platesData){

    var plates = L.geoJSON(platesData,{
        
        style: () => ({color:'#007d11', fillOpacity:0})

    });
    return plates;

  }

function createLegend(){
    let div = L.DomUtil.create("div", "INFO");
    let lbls = ['1','2','3','4','5','6','7','8','9+']

    lbls.forEach((element) => {
        div.innerHTML += `${element} </br>`;
    })
    return div;
}
//-----------------------------------------------------------------------------------------------------------------------------------

Promise.all([d3.json(QUERY_URL), d3.json(PLATES_GEOJSON)]).then((values) =>
{

    let earthquakes = getEarthquakes(values[0]);
    let plates = getPlates(values[1]);
    let overlayMaps = {"Eartquakes": earthquakes, "Tectonic plates": plates};
    let legend = L.control({position:"bottomright"})

    legend.onAdd = function(){
        let div = L.DomUtil.create("div", "legend");
        let lbls = ['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','9+']
        let idxColor = 0

        html = `<p style = \ "background:white\">`
        lbls.forEach((element) => {
            html += `<span style = \"background:${COLORS[idxColor]}\">	&emsp; </span> ${element}</br>`;
            idxColor += 1;
        })
        html += `</p>`
        div.innerHTML = html
        return div;
    }
    legend.addTo(MY_MAP);
    L.control.layers(BASE_MAPS, overlayMaps).addTo(MY_MAP);

});



    

  

