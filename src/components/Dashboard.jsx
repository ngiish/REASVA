import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from './mapsConfig';

const containerStyle = {
  width: '100%',
  height: '600px',
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
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure user is defined

      try {
        const response = await axios.get('/api/data', {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const fetchedData = Array.isArray(response.data) ? response.data : [];
        setData(fetchedData);
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

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <div className="dashboard-content">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-teal-50 shadow-lg rounded-lg">
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

        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
  <GoogleMap
    mapContainerStyle={containerStyle}
    center={center}
    zoom={10}
    onLoad={onLoad}
    onUnmount={onUnmount}
    onClick={handleMapClick} // Add click event to map
  >
    {/* Render all markers */}
    {markers.map((marker, index) => (
      <Marker
        key={index}
        position={marker.position}
        onClick={() => {
          setSelectedMarker(marker); // Set the clicked marker for InfoWindow
          setInfoWindowOpen(true);   // Ensure the InfoWindow opens
        }}
      />
    ))}

    {/* InfoWindow for the selected marker */}
    {infoWindowOpen && selectedMarker && (
      <InfoWindow
        position={selectedMarker.position}
        onCloseClick={() => {
          setInfoWindowOpen(false);   // Close InfoWindow when "X" is clicked
          setSelectedMarker(null);    // Clear the selected marker
        }}
      >
        <div>
          <h4>{selectedMarker.title}</h4> {/* Display marker title */}
          <p>{selectedMarker.description}</p> {/* Display marker description */}
          <p>{selectedMarker.address}</p> {/* Display formatted address */}
        </div>
      </InfoWindow>
    )}
  </GoogleMap>
</LoadScript>

      </div>
    </div>
  );
};

export default Dashboard;
