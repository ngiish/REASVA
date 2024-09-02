import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;  // Ensure user is defined

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
    return <p>Please log in to view the dashboard.</p>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
