$(document).ready(function () {

	// Rounding corners
	$('#nodelist').corner();
});


var lon = 25.0;
var lat = 60.2;
var zoom = 9;
var map, infocontrols, water, highlightlayer, layer;

function init(){
	
	var options = { controls:[
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.ScaleLine(),
			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.Attribution()],
		projection: new OpenLayers.Projection("EPSG:900913"),
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		units: "m",
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34,
										 20037508.34, 20037508.34)
	};
	
	var proj = new OpenLayers.Projection("EPSG:4326");

	map = new OpenLayers.Map('map', options);
	
	layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
			"http://vmap0.tiles.osgeo.org/wms/vmap0", {layers: 'basic'} );
		
	var palvelut = new OpenLayers.Layer.WMS("palvelut",
		"http://geoservices.hut.fi:8080/geoserver/wms", 
		{'layers': 'cite:palvelut_laatikko', srs: 'EPSG:2393', transparent: true, format: 'image/png'},
		{isBaseLayer: false}
	);
	
	highlightLayer = new OpenLayers.Layer.Vector("Highlighted Features", {
		displayInLayerSwitcher: false, 
		isBaseLayer: false 
		}
	);

	var mapnik = new OpenLayers.Layer.OSM();
	
	infoControls = {
		click: new OpenLayers.Control.WMSGetFeatureInfo({
			url: 'http://geoservices.hut.fi:8080/geoserver/wms', 
			title: 'Identify features by clicking',
			layers: [palvelut],
			queryVisible: true
		})
	}

	map.addLayers([mapnik, layer, palvelut, highlightLayer]);
	
	for (var i in infoControls) { 
		infoControls[i].events.register("getfeatureinfo", this, showInfo);
		map.addControl(infoControls[i]); 
	}
	
	map.addControl(new OpenLayers.Control.LayerSwitcher());

	infoControls.click.activate();
	
	var point = new OpenLayers.LonLat(lon, lat);
	map.setCenter(point.transform(proj, map.getProjectionObject()), zoom);
}

function showInfo(evt) {
	if (evt.features && evt.features.length) {
		 highlightLayer.destroyFeatures();
		 highlightLayer.addFeatures(evt.features);
		 highlightLayer.redraw();
	} else {
		$('#nodelist').innerHTML = evt.text;
		jQuery(function($) {
			$('#nodelist').load('http://geoservices.hut.fi:8080/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=cite%3Apalvelut_laatikko&QUERY_LAYERS=cite%3Apalvelut_laatikko&STYLES=&BBOX=2562848.628023%2C8387684.653608%2C3003125.910866%2C8501117.203563&FEATURE_COUNT=10&HEIGHT=371&WIDTH=1440&FORMAT=image%2Fpng&INFO_FORMAT=text%2Fhtml&SRS=EPSG%3A900913&X=537&Y=109');
		});
	}
}
