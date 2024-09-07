import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure user is defined

      try {
        const response = await axios.get('/api/data', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data', error);
        setError('Failed to fetch data. Please try again.');
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return <p className="text-center mt-10 text-red-500">Please log in to view the dashboard.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-teal-50 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">Dashboard</h2>
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <ul className="space-y-4">
          {data.map((item, index) => (
            <li
              key={index}
              className="p-4 bg-white rounded shadow hover:bg-teal-100 transition duration-200"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
