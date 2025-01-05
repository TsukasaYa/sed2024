'use client'; // クライアントコンポーネントを有効化
import { useState, useEffect } from 'react';

interface RaceData {
  race_id: string;
  round: string;
  name: string;
}

interface RaceHorse{
  number     : number
  name       : string
  odds       : number
  votingRate : number
}

interface QuinellaBet{
  firstHorse  : number
  secondHorse : number
  odds        : number
  votingRate  : number
  expetedRate : number
}

const OddsPage = () => {
  const [raceCard, setRaceCard] = useState<RaceHorse[]>([]);
  const [quinellaBets, setQuinellaBets] = useState<QuinellaBet[]>([]);
  const [selcetedBets, setSelcetedBets] = useState<QuinellaBet[]>([]);
  const [selection, setSelection] = useState<number[]>([]); // 選択した馬番

  useEffect(() => {
    const fetchRaceCard = async () => {
      try {
        const response = await fetch('http://localhost:8000/race_card');
        const data = await response.json();
        console.log(data);
        const mappedData: RaceHorse[] = data.map((item) => ({
          number : item["馬番"],  // "馬番" → num
          name : item["馬名"],  // "馬名" → name
          odds : item["オッズ"], // "オッズ" → odds
          votingRate : item["支持率"] // "支持率" → ratio
        }));
        setRaceCard(mappedData);
        console.log(raceCard);
      } catch (error) {
        console.error('Error fetching race card:', error);
      }
    };
    const fetchQuinellaBet = async () => {
      try {
        const response = await fetch('http://localhost:8000/umaren');
        const data = await response.json();
        console.log(data);
        const mappedData: QuinellaBet[] = data.map((item) => ({
          firstHorse : item["馬番1"],
          secondHorse: item["馬番2"], 
          odds       : item["オッズ"],
          votingRate : item["支持率"],
          expetedRate: item["単勝ベース"]
        }));
        setQuinellaBets(mappedData);
      } catch (error) {
        console.error('Error fetching 馬連:', error);
      }
    };
    fetchRaceCard();
    fetchQuinellaBet();
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
    const newBets = quinellaBets.filter((row) =>
      selection.includes(row.firstHorse) && selection.includes(row.secondHorse)
    );
    setSelcetedBets(newBets);
    sendSelection();
  }, [selection]);

  const sendSelection = async () => {
    try {
      const response = await fetch('http://localhost:8000/selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selection: selection }),
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

  // 特徴的なオッズに色付け
  const emphasisOdds = (row: QuinellaBet) => {
    const deviation = row.expetedRate / row.votingRate;
    const encouragedRatio = 1.3
    const discouragedRatio = 0.7

    if (deviation <= discouragedRatio) {
      return { color: 'darkred', fontWeight: 'bold' };
    } else if (deviation >= encouragedRatio) {
      return { color: 'lightblue', fontWeight: 'bold' };
    } else {
      return {};
    }
  };

  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px' }}>
      <h1>オッズ確認</h1>
      <h2>出馬表</h2>
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
            <tr key={horse.number}
                style={{
                backgroundColor: selection.includes(horse.number)
                  ? 'lightyellow' // 選択された行の背景色
                  : 'white', // 選択されていない行の背景色
                }}>
              <td style={{ border: '1px solid black', padding: '8px' }}>
                <button onClick={() => handleToggle(horse.number)}>
                  {selection.includes(horse.number) ? '✅' : '[ -- ]'}
                </button>
              </td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.number}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.odds}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{horse.votingRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>オッズ一覧：水色がおすすめの買い目</h2>
      <table style={{ width: '100%', border: '1px solid black', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>1頭目</th>
            <th>2頭目</th>
            <th>オッズ</th>
            <th>支持率</th>
            <th>単勝ベース</th>
          </tr>
        </thead>
        <tbody>
          {selcetedBets.map((row, index) => (
            <tr key={index}>
              <td>{row.firstHorse}</td>
              <td>{row.secondHorse}</td>
              <td style={emphasisOdds(row)}>{row.odds}</td>
              <td>{row.votingRate}</td>
              <td>{row.expetedRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OddsPage;