export const displayMap = (locations) => {
  // console.log(locations);
  const map = L.map('map', {
    scrollWheelZoom: false,
  });

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      maxZoom: 19,
    }
  ).addTo(map);
  // L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  //   maxZoom: 19,
  // }).addTo(map);

  const bounds = L.latLngBounds();

  locations.forEach((loc) => {
    const swappedLatLngCoordinates = [loc.coordinates[1], loc.coordinates[0]]; // because it has to be lat and lng not in reverse
    // Create marker icon
    const myIcon = L.icon({
      iconUrl: `${window.location.origin}/img/pin.png`,
      iconSize: [32, 40],
      iconAnchor: [22, 94],
    });
    L.marker(swappedLatLngCoordinates, { icon: myIcon }).addTo(map);
    L.popup(swappedLatLngCoordinates, {
      content: `<p>Day ${loc.day}: ${loc.description}</p>`,
      offset: L.point(-5, -70),
    }).addTo(map);

    bounds.extend(swappedLatLngCoordinates);
  });

  map.fitBounds(bounds, {
    paddingTopLeft: [100, 200],
    paddingBottomRight: [100, 50],
  });
};
