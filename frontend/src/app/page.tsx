import Image from "next/image";
'use client'; // クライアントコンポーネントを有効化

import { useEffect, useState } from 'react';

type Race = {
  date: string;
  course: string;
  round: number;
  name: string;
  race_id: number;
};

export default function Home() {
  const [data, setData] = useState<Race[]>([]);
  const [filteredData, setFilteredData] = useState<Race[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8000/races');
      const jsonData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter((item) => item.course === '中山' && item.date === '20250105');
    setFilteredData(filtered);
  }, [data]);

  return (
    <div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Course</th>
            <th>Round</th>
            <th>Name</th>
            <th>Race ID</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.course}</td>
              <td>{row.round}</td>
              <td>{row.name}</td>
              <td>{row.race_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
