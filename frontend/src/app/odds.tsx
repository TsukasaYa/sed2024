import { useState, useEffect } from 'react';

interface RaceData {
  race_id: string;
  round: string;
  name: string;
}

const OddsPage = () => {
  const [raceData, setRaceData] = useState<RaceData | null>(null);

  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px' }}>
      <h1>オッズ確認</h1>
      <h2>この辺に出馬表兼マークシート</h2>
      <h2>この辺にオッズ一覧</h2>
    </div>
  );
};

export default OddsPage;