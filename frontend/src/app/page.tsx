import Image from "next/image";
'use client'; // クライアントコンポーネントを有効化

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:8000/races');
      const jsonData = await response.json();
      setData(jsonData);
    };

    fetchData();
  }, []);

  // フィルタ
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        (selectedDate ? item.date === selectedDate : true) &&
        (selectedCourse ? item.course === selectedCourse : true)
    );
    setFilteredData(filtered);
  }, [data, selectedDate, selectedCourse]);

  // 日付とコースのユニークなリストを生成
  const dates = Array.from(new Set(data.map((item) => item.date)));
  const courses = Array.from(new Set(data.map((item) => item.course)));

  const handleRowClick = async (raceId: number) => {
    setSelectedRaceId(raceId);

    // レースIDをバックエンドに送信
    const response = await fetch('http://localhost:8000/send_id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ race_id: raceId }),
    });
    if (!response.ok) {
      throw new Error('Failed to set race ID');
    }

    router.push(`/odds`);

  };

  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px' }}>
      <div>
        <label htmlFor="date">日付: </label>
        <select
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            backgroundColor: '#f0f8ff', // 背景色
            color: '#333', // 文字色
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        >
          <option value="">All Dates</option>
          {dates.map((date) => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="course">競馬場: </label>
        <select
          id="course"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{
            backgroundColor: '#f0f8ff', // 背景色
            color: '#333', // 文字色
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '10px',
          }}
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>
      {selectedRaceId && (
        <div style={{ marginTop: '20px' }}>
          <h3>Selected Race ID: {selectedRaceId}</h3>
        </div>
      )}
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
        <thead>
        <tr>
            <th
              style={{
                border: '1px solid #ccc', // セルの罫線
                padding: '10px', // セル内の余白
                backgroundColor: '#f2f2f2', // ヘッダー背景色
              }}
            >
              Round
            </th>
            <th
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                backgroundColor: '#f2f2f2',
              }}
            >
              レース名
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr 
              key={row.race_id}
              onClick={() => handleRowClick(row.race_id)}
              style={{
                cursor: 'pointer', // クリック可能なカーソル
                backgroundColor: selectedRaceId === row.race_id ? '#f0f8ff' : '', // 選択された行の背景色
              }}
            >
              <td
                style={{
                  border: '1px solid #ccc', // セルの罫線
                  padding: '10px', // セル内の余白
                }}
              >
                {row.round}
              </td>
              <td
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                }}
              >
                {row.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
