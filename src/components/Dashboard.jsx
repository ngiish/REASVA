import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from './mapsConfig';

// Adjusted containerStyle for full screen
const containerStyle = {
  width: '100%',
  height: '100%', // Change height to 100% for full screen
};

const center = {
  lat: -1.286389,
  lng: 36.817223,
};

const Dashboard = ({ user }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]); // Store multiple markers
  const [selectedMarker, setSelectedMarker] = useState(null); // Track the selected marker for InfoWindow
  const [infoWindowOpen, setInfoWindowOpen] = useState(false); // Track if the InfoWindow is open
  const [directionsResponse, setDirectionsResponse] = useState(null); // Store directions result
  const [distance, setDistance] = useState(''); // Distance between two markers
  const [duration, setDuration] = useState(''); // Duration between two markers

  const originRef = useRef(); // Ref for origin input
  const destinationRef = useRef(); // Ref for destination input
  const placeNameRef = useRef(); // Ref for the place name input

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure user is defined

      try {
        const response = await axios.get('/api/data', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const fetchedData = Array.isArray(response.data) ? response.data : [];

        // Assuming fetchedData contains objects with latitude and longitude
        const newMarkers = fetchedData.map(item => ({
          position: {
            lat: item.latitude, // Replace with actual property for latitude
            lng: item.longitude, // Replace with actual property for longitude
          },
          address: item.address || 'Address not available', // Use item.address if available
          title: item.name || 'Location', // Use item.name or a default value
          description: item.description || 'No description available.', // Provide a default
        }));

        setMarkers(newMarkers); // Set the markers state with fetched locations
        setData(fetchedData); // Keep existing state update for other UI components
      } catch (error) {
        console.error('Error fetching data', error);
        setError('Failed to fetch data. Please try again.');
      }
    };

    fetchData();
  }, [user]);

  // Function to handle geocoding using latitude and longitude
  const handleGeocode = async (geocoder) => {
    const input = document.getElementById('latlng').value;
    const latlngStr = input.split(',', 2); // Split the input into lat and lng
    const latlng = {
      lat: parseFloat(latlngStr[0]), // Convert latitude to float
      lng: parseFloat(latlngStr[1]), // Convert longitude to float
    };

    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results.length > 0) {
        const newMarker = {
          position: latlng,
          address: response.results[0].formatted_address,
          title: 'Custom Title', // Replace with dynamic title if needed
          description: 'Additional information about this location.', // Additional info
        };
        setMarkers((current) => [...current, newMarker]); // Add new marker to the state
        map.setCenter(latlng); // Center the map on the new position
      } else {
        window.alert('No results found');
      }
    } catch (e) {
      window.alert(`Geocoder failed due to: ${e}`);
    }
  };

  // Function to handle map click event
  const handleMapClick = (event) => {
    const latlng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    const newMarker = {
      position: latlng,
      address: 'New Marker', // Placeholder for address
      title: 'New Marker Title', // Placeholder for title
      description: 'Description for the new marker.', // Placeholder for description
    };
    setMarkers((current) => [...current, newMarker]); // Add new marker to the state
  };

  // Function to always open InfoWindow when marker is clicked
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setInfoWindowOpen(true); // Always open the InfoWindow on marker click
  };

  // Function to handle place search using Google Places API
  const handlePlaceSearch = () => {
    const placeName = placeNameRef.current.value;
    const service = new window.google.maps.places.PlacesService(map);

    // Define the request to find the place by name
    const request = {
      query: placeName,
      fields: ['name', 'geometry'],
    };

    // Make the request using the PlacesService
    service.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        const place = results[0];
        const newMarker = {
          position: place.geometry.location,
          address: place.name,
          title: place.name,
          description: 'Description for the place.',
        };
        setMarkers((current) => [...current, newMarker]);
        map.setCenter(place.geometry.location);
      } else {
        window.alert('Place not found');
      }
    });
  };

  // Calculate the route between two selected markers
  async function calculateRoute() {
    if (markers.length < 2) {
      alert('Please add at least two markers to calculate a route.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: { lat: markers[0].position.lat, lng: markers[0].position.lng },
      destination: { lat: markers[1].position.lat, lng: markers[1].position.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <div className="dashboard-content h-screen w-screen"> {/* Full height and width */}
      <div className="h-full w-full p-6 bg-teal-50 shadow-lg rounded-lg"> {/* Covering full screen */}
        <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">Dashboard</h2>

        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <ul className="space-y-4">
            {data.length > 0 ? (
              data.map((item, index) => (
                <li
                  key={index}
                  className="p-4 bg-white rounded shadow hover:bg-teal-100 transition duration-200"
                >
                  {item}
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No data available.</p>
            )}
          </ul>
        )}

        {/* Geocoding input */}
        <div className="my-6">
          <input
            id="latlng"
            type="text"
            placeholder="Enter latitude,longitude"
            className="p-2 border border-teal-400 rounded"
          />
          <button
            id="submit"
            className="p-2 ml-2 bg-teal-600 text-white rounded"
            onClick={() => handleGeocode(new window.google.maps.Geocoder())}
          >
            Geocode
          </button>
        </div>

        {/* Place Name Search */}
        <div className="my-6">
          <input
            ref={placeNameRef}
            type="text"
            placeholder="Enter place name"
            className="p-2 border border-teal-400 rounded"
          />
          <button
            className="p-2 ml-2 bg-teal-600 text-white rounded"
            onClick={handlePlaceSearch}
          >
            Find Place
          </button>
        </div>

        <button onClick={calculateRoute} className="p-2 bg-blue-600 text-white rounded">
          Calculate Route
        </button>

        <div>
          <p>Distance: {distance}</p>
          <p>Duration: {duration}</p>
        </div>

        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={8}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick} // Handle map click to add marker
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                onClick={() => handleMarkerClick(marker)} // Open InfoWindow on marker click
              />
            ))}
            {selectedMarker && infoWindowOpen && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setInfoWindowOpen(false)} // Close the InfoWindow
              >
                <div>
                  <h4>{selectedMarker.title}</h4>
                  <p>{selectedMarker.description}</p>
                  <p>{selectedMarker.address}</p>
                </div>
              </InfoWindow>
            )}
            {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default Dashboard;
