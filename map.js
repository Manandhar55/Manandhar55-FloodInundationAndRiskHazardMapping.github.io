// Initialize the map
const map = L.map('map').setView([27.7, 85.3], 8); // Centered around Nepal

// Add a base layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON data for flood hazard zones (replace 'flood_hazard_zones.geojson' with your actual file path)
fetch('flood_hazard_zones.geojson')
    .then(response => response.json())
    .then(data => {
        // Store the data globally for filtering
        window.hazardData = data;

        // Add the GeoJSON layer to the map
        window.hazardLayer = L.geoJSON(data, {
            style: styleFeature,
            onEachFeature: onEachFeature
        }).addTo(map);
    });

// Function to style features based on hazard level
function styleFeature(feature) {
    const hazardLevel = feature.properties.hazard_level;
    return {
        color: getHazardColor(hazardLevel),
        weight: 2,
        fillOpacity: 0.5
    };
}

// Function to determine color based on hazard level
function getHazardColor(level) {
    switch (level) {
        case 'High': return '#ff0000';
        case 'Medium': return '#ffa500';
        case 'Low': return '#00ff00';
        default: return '#0000ff';
    }
}

// Bind popups to each feature
function onEachFeature(feature, layer) {
    layer.on('click', function () {
        const properties = feature.properties;
        const infoSection = document.querySelector('.info-section');
        infoSection.innerHTML = `<h3>Zone Information</h3>
                                 <p><strong>Hazard Level:</strong> ${properties.hazard_level}</p>
                                 <p><strong>Description:</strong> ${properties.description}</p>`;
    });
}

// Add a filter for hazard levels using the dropdown in the sidebar
document.getElementById('hazardFilter').addEventListener('change', function () {
    const selectedValue = this.value;
    filterHazardZones(selectedValue);
});

// Function to filter hazard zones based on dropdown selection
function filterHazardZones(level) {
    // Clear current layer
    if (window.hazardLayer) {
        map.removeLayer(window.hazardLayer);
    }

    // Filter the GeoJSON data
    const filteredData = {
        type: 'FeatureCollection',
        features: window.hazardData.features.filter(feature => {
            return level === 'all' || feature.properties.hazard_level.toLowerCase() === level;
        })
    };

    // Add filtered data to the map
    window.hazardLayer = L.geoJSON(filteredData, {
        style: styleFeature,
        onEachFeature: onEachFeature
    }).addTo(map);
}
