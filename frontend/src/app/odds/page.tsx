'use client'; // クライアントコンポーネントを有効化
import { useState, useEffect } from 'react';

interface RaceData {
  race_id: string;
  round: string;
  name: string;
}

interface RaceHorse{
  num  : number
  name : string
  odds : number
  ratio: number
}

interface UmarenBet{

}

const OddsPage = () => {
  const [raceCard, setRaceCard] = useState<RaceHorse[]>([]);
  const [selection, setSelection] = useState<number[]>([]); // 選択した馬番

  useEffect(() => {
    const fetchRaceCard = async () => {
      try {
        const response = await fetch('http://localhost:8000/race_card');
        const data = await response.json();
        console.log(data);
        const mappedData = data.map((item) => ({
          num: item["馬番"],  // "馬番" → num
          name: item["馬名"],  // "馬名" → name
          odds: item["オッズ"], // "オッズ" → odds
          ratio: item["支持率"] // "支持率" → ratio
        }));
        setRaceCard(mappedData);
        console.log(raceCard);
      } catch (error) {
        console.error('Error fetching race card:', error);
      }
    };
    fetchRaceCard();
  }, []);

  const handleToggle = (num: number) => {
    setSelection((prevSelected) => {
      if (prevSelected.includes(num)) {
        return prevSelected.filter((horseNum) => horseNum !== num); // 馬番がすでに選択されていれば削除
      } else {
        return [...prevSelected, num]; // 馬番を追加
      }
    });
  };

  useEffect(() => {
    sendSelection();

  }, [selection]);

  const sendSelection = async () => {
    try {
      const response = await fetch('http://localhost:8000/selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selection: selection }), // 選択された馬番の配列を送信
      });
      if (!response.ok) {
        throw new Error('Failed to send data to backend');
      }
      const data = await response.json();
      console.log('Backend response:', data);
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px' }}>
      <h1>オッズ確認</h1>
      <h2>↓この辺に出馬表兼マークシート↓</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>選択</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>馬番</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>馬名</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>オッズ</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>単勝支持率</th>
          </tr>
        </thead>
        <tbody>
          {raceCard.map((horse) => (
            <tr key={horse.num}
                style={{
                backgroundColor: selection.includes(horse.num)
                  ? 'lightyellow' // 選択された行の背景色
                  : 'white', // 選択されていない行の背景色
                }}>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <button onClick={() => handleToggle(horse.num)}>
                  {selection.includes(horse.num) ? '✅' : '[ -- ]'}
                </button>
              </td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.num}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.odds}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>この辺にオッズ一覧</h2>
    </div>
  );
};

export default OddsPage;