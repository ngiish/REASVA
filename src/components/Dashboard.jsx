// // import React, { useEffect, useState } from 'react';
// // import axios from 'axios';
// // import { APIProvider } from '@vis.gl/react-google-maps';
// // import { Map, GoogleApiWrapper } from 'google-maps-react';

// // const Dashboard = ({ user }) => {
// //   const [data, setData] = useState([]);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (!user) return; // Ensure user is defined

// //       try {
// //         const response = await axios.get('/api/data', {
// //           headers: { Authorization: `Bearer ${user.token}` }
// //         });

// //         // Check if the response data is an array
// //         const fetchedData = Array.isArray(response.data) ? response.data : [];
// //         setData(fetchedData);
// //       } catch (error) {
// //         console.error('Error fetching data', error);
// //         setError('Failed to fetch data. Please try again.');
// //       }
// //     };

// //     fetchData();
// //   }, [user]);

// //   if (!user) {
// //     return <p className="text-center mt-10 text-red-500">Please log in to view the dashboard.</p>;
// //   }

// //   return (

// //     <Map
// //     google = {this.props.google}
// //     style = {{width:"100%", height:"100%"}}
// //     zoom = {10}
// //     initialCenter = {
// //       {    
// //       lat: -1.292066,
// //       lng: 36.821945
// //     }
// //     }
    
// //     >

// //     <div className="max-w-4xl mx-auto mt-10 p-6 bg-teal-50 shadow-lg rounded-lg">
// //       <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">Dashboard</h2>
// //       {error ? (
// //         <p className="text-red-500 text-center">{error}</p>
// //       ) : (
// //         <ul className="space-y-4">
// //           {data.length > 0 ? (
// //             data.map((item, index) => (
// //               <li
// //                 key={index}
// //                 className="p-4 bg-white rounded shadow hover:bg-teal-100 transition duration-200"
// //               >
// //                 {item}
// //               </li>
// //             ))
// //           ) : (
// //             <p className="text-center text-gray-500">No data available.</p>
// //           )}
// //         </ul>
// //       )}
// //     </div>
// //     </Map>

// //   );
// // };

// // // export default Dashboard;
// // export default GoogleApiWrapper({
// //   apiKey:"AIzaSyA3"
// // }) (MapContainer)

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Map, GoogleApiWrapper } from '@react-google-maps/api';

// const Dashboard = ({ user, google }) => {
//   const [data, setData] = useState([]);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!user || !user.token) return; // Ensure user and token are defined

//       try {
//         const response = await axios.get('/api/data', {
//           headers: { Authorization: `Bearer ${user.token}` }
//         });

//         const fetchedData = Array.isArray(response.data) ? response.data : [];
//         setData(fetchedData);
//       } catch (error) {
//         console.error('Error fetching data', error);
//         setError('Failed to fetch data. Please try again.');
//       }
//     };

//     fetchData();
//   }, [user]);

//   if (!user) {
//     return <p className="text-center mt-10 text-red-500">Please log in to view the dashboard.</p>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto mt-10 p-6 bg-teal-50 shadow-lg rounded-lg">
//       <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">Dashboard</h2>
//       {error ? (
//         <p className="text-red-500 text-center">{error}</p>
//       ) : (
//         <>
//           <Map
//             google={google} // use google from props
//             style={{ width: "100%", height: "400px" }}
//             zoom={10}
//             initialCenter={{ lat: -1.292066, lng: 36.821945 }} // Center on Nairobi
//           />
//           <ul className="space-y-4 mt-4">
//             {data.length > 0 ? (
//               data.map((item, index) => (
//                 <li
//                   key={index}
//                   className="p-4 bg-white rounded shadow hover:bg-teal-100 transition duration-200"
//                 >
//                   {item}
//                 </li>
//               ))
//             ) : (
//               <p className="text-center text-gray-500">No data available.</p>
//             )}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// };

// // Wrap Dashboard with GoogleApiWrapper for Google Maps
// export default GoogleApiWrapper({
//   apiKey: "AE"
// })(Dashboard);



import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from './mapsConfig'; // Import API key from mapsConfig.js

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
  const [markerPosition, setMarkerPosition] = useState(center);
  const [address, setAddress] = useState('');
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
  const handleGeocode = async (geocoder, map, infoWindow) => {
    const input = document.getElementById('latlng').value;
    const latlngStr = input.split(',', 2); // Split the input into lat and lng
    const latlng = {
      lat: parseFloat(latlngStr[0]), // Convert latitude to float
      lng: parseFloat(latlngStr[1]), // Convert longitude to float
    };

    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results && response.results.length > 0) {
        setMarkerPosition(latlng);
        setAddress(response.results[0].formatted_address); // Set the formatted address
        setInfoWindowOpen(true); // Open the InfoWindow
        map.setCenter(latlng); // Center the map on the new position
      } else {
        window.alert('No results found');
      }
    } catch (e) {
      window.alert(`Geocoder failed due to: ${e}`);
    }
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
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
          onClick={() => handleGeocode(new window.google.maps.Geocoder(), map, new window.google.maps.InfoWindow())}
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
        >
          { /* Marker and InfoWindow */}
          <Marker position={markerPosition} />
          {infoWindowOpen && (
            <InfoWindow position={markerPosition}>
              <div>{address}</div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Dashboard;
