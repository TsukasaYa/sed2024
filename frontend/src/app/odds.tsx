import { useState, useEffect } from 'react';

interface RaceData {
  race_id: string;
  round: string;
  name: string;
}

const OddsPage = () => {
  const [raceId, setRaceId] = useState<string | null>(null);
  const [raceData, setRaceData] = useState<RaceData | null>(null);

  useEffect(() => {
    if (raceId) {
      fetch(`http://localhost:8000/races/${raceId}`)
        .then((response) => response.json())
        .then((data) => setRaceData(data))
        .catch((error) => console.error('Error fetching data:', error));
    }
  }, [raceId]);

  const handleRaceClick = (id: string) => {
    setRaceId(id);
  };

  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px' }}>
      <h1>オッズ確認</h1>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => handleRaceClick('1')} style={{ marginRight: '10px' }}>
          レース 1
        </button>
        <button onClick={() => handleRaceClick('2')}>レース 2</button>
      </div>

      {raceData && (
        <table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ラウンド</th>
              <th>レース名</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{raceData.round}</td>
              <td>{raceData.name}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OddsPage;