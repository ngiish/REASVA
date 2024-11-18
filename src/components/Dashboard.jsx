import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "./mapsConfig";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseconfig/firebaseConfig";

// Map container styling
const containerStyle = {
  width: "100%",
  height: "100%",
};

// Map center coordinates
const center = {
  lat: -1.286389,
  lng: 36.817223,
};

const Dashboard = ({ user }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]); // All markers (Firebase + user-added)
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const placeNameRef = useRef(); // Ref for place name search

  // **1. Fetch data from Firebase**
  useEffect(() => {
    const fetchFirebaseLocations = () => {
      const locationsRef = ref(db, "/locations");
      const unsubscribe = onValue(locationsRef, (snapshot) => {
        const fetchedData = snapshot.val();
        if (fetchedData) {
          const firebaseMarkers = Object.values(fetchedData).map((item) => ({
            position: {
              lat: item.latitude,
              lng: item.longitude,
            },
            address: item.address || "Address not available",
            title: item.name || "Location",
            description: item.description || "No description available.",
          }));
          setMarkers((current) => [...current, ...firebaseMarkers]);
        }
      });
      return unsubscribe;
    };

    const unsubscribe = fetchFirebaseLocations();
    return () => unsubscribe(); // Cleanup Firebase listener
  }, []);

  // **2. Handle user-added markers**
  const handleMapClick = (event) => {
    const latlng = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    const newMarker = {
      position: latlng,
      address: "User Marker",
      title: "Custom Marker",
      description: "User-added location.",
    };
    setMarkers((current) => [...current, newMarker]);
  };

  // **3. Handle marker click (InfoWindow)**
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setInfoWindowOpen(true);
  };

  // **4. Geocoding handler**
  const handleGeocode = async (geocoder) => {
    const input = document.getElementById("latlng").value;
    const [lat, lng] = input.split(",").map(Number);

    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results.length > 0) {
        const newMarker = {
          position: { lat, lng },
          address: response.results[0].formatted_address,
          title: "Geocoded Location",
          description: "Geocoded from input coordinates.",
        };
        setMarkers((current) => [...current, newMarker]);
        map.setCenter({ lat, lng });
      } else {
        alert("No results found.");
      }
    } catch (e) {
      alert(`Geocoder failed: ${e.message}`);
    }
  };

  // **5. Place search handler**
  const handlePlaceSearch = () => {
    const placeName = placeNameRef.current.value;
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      query: placeName,
      fields: ["name", "geometry"],
    };

    service.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        const place = results[0];
        const newMarker = {
          position: place.geometry.location,
          address: place.name,
          title: place.name,
          description: "Place searched via name.",
        };
        setMarkers((current) => [...current, newMarker]);
        map.setCenter(place.geometry.location);
      } else {
        alert("Place not found.");
      }
    });
  };

  // **6. Calculate route between first and last markers**
  const calculateRoute = async () => {
    if (markers.length < 2) {
      alert("Please add at least two markers to calculate a route.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const origin = markers[0].position;
    const destination = markers[markers.length - 1].position;

    try {
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirectionsResponse(result);
      setDistance(result.routes[0].legs[0].distance.text);
      setDuration(result.routes[0].legs[0].duration.text);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  const onLoad = useCallback((map) => setMap(map), []);
  const onUnmount = useCallback(() => setMap(null), []);

  return (
    <div className="dashboard-content h-screen w-screen">
      <div className="h-full w-full p-6 bg-teal-50 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">Dashboard</h2>

        {/* Geocoding input */}
        <div className="my-6">
          <input
            id="latlng"
            type="text"
            placeholder="Enter latitude,longitude"
            className="p-2 border border-teal-400 rounded"
          />
          <button
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

        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={marker.position}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}

            {selectedMarker && infoWindowOpen && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setInfoWindowOpen(false)}
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
