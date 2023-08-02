import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const socket = io('http://localhost:5000'); 
function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch initial data from the server
    socket.on('initialData', (initialData) => {
      setData(initialData);
    });

    // Listen for real-time updates from the server
    socket.on('newData', (newData) => {
      setData((prevData) => [...prevData, newData]);
    });
  }, []);

  const handleDataSubmit = (value) => {
    // Emit new data to the server
    socket.emit('newData', { value });
  };

  return (
    <div>
      <h1>Live Temperature Data</h1>
      <LineChart width={600} height={300} data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <CartesianGrid stroke="#f5f5f5" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#ff7300" yAxisId={0} />
      </LineChart>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const newValue = e.target.elements.temperature.value;
          handleDataSubmit(newValue);
        }}
      >
        <input type="number" name="temperature" placeholder="Enter Temperature" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
