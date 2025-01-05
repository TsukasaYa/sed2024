'use client'; // クライアントコンポーネントを有効化
import { stringifyResumeDataCache } from 'next/dist/server/resume-data-cache/resume-data-cache';
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
  const [selectedHorses, setSelectedHorses] = useState<number[]>([]); // 選択した馬番

  const fetchRaceData = async (url: string) => {
    const response = await fetch('http://localhost:8000/'+url);
    return await response.json();
  };

  useEffect(() => {
    (async () =>{
      const tasks = [{ url: 'race-card', setter: setRaceCard },
                     { url: 'quinellas', setter: setQuinellaBets}];
      for (const task of tasks) {
        try {
          const data = await fetchRaceData(task.url);
          task.setter(data);
        } catch (error) {
          console.error(`Error fetching ${task.url}:`, error);
        }
      }
    })()
  }, []);

  const handleToggle = (num: number) => {
    setSelectedHorses((prevSelected) => {
      if (prevSelected.includes(num)) {
        return prevSelected.filter((horseNum) => horseNum !== num); // 馬番がすでに選択されていれば削除
      } else {
        return [...prevSelected, num]; // 馬番を追加
      }
    });
  };

  useEffect(() => {
    const newBets = quinellaBets.filter((row) =>
      selectedHorses.includes(row.firstHorse) && selectedHorses.includes(row.secondHorse)
    );
    setSelcetedBets(newBets);
    sendSelection();
  }, [selectedHorses]);

  const sendSelection = async () => {
    try {
      const response = await fetch('http://localhost:8000/selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selection: selectedHorses }),
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
      return 'text-red-700 font-bold';
    } else if (deviation >= encouragedRatio) {
      return 'text-sky-300 font-bold';
    } else {
      return '';
    }
  };

  return (
    <div className="bg-blue-50 text-black p-5">
      <h1>オッズ確認</h1>
      <h2>出馬表</h2>
      <table className="w-full border-collapse mt-5">
        <thead className="border border-black bg-gray-200">
          <tr>
            <th className="border border-black p-2">選択</th>
            <th className="border border-black p-2">馬番</th>
            <th className="border border-black p-2">馬名</th>
            <th className="border border-black p-2">オッズ</th>
            <th className="border border-black p-2">単勝支持率</th>     
          </tr>
        </thead>
        <tbody>
          {raceCard.map((horse) => (
            <tr key={horse.number}
              className={`${selectedHorses.includes(horse.number) ? 'bg-yellow-100' : 'bg-white' }`}
            >
              <td className="border border-black p-2">
                <button onClick={() => handleToggle(horse.number)}>
                  {selectedHorses.includes(horse.number) ? '✅' : '[ -- ]'}
                </button>
              </td>
              <td className="border border-black p-2">{horse.number}</td>
              <td className="border border-black p-2">{horse.name}</td>
              <td className="border border-black p-2">{horse.odds}</td>
              <td className="border border-black p-2">{horse.votingRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="text-l mt-10">オッズ一覧：水色がおすすめの買い目</h2>
      <table className="w-full border border-black bg-neutral-50 mt-5 border-collapse">
        <thead className="w-full border border-black">
          <tr>
            <th className="p-2">1頭目</th>
            <th className="p-2">2頭目</th>
            <th className="p-2">オッズ</th>
            <th className="p-2">支持率</th>
            <th className="p-2">単勝ベース</th>
          </tr>
        </thead>
        <tbody>
          {selcetedBets.map((row, index) => (
            <tr key={index} className="border-b border-gray-300">
              <td className="px-2">{row.firstHorse}</td>
              <td className="px-2">{row.secondHorse}</td>
              <td className={`px-2 ${emphasisOdds(row)}`}>{row.odds}</td>
              <td className="px-2">{row.votingRate}</td>
              <td className="px-2">{row.expetedRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OddsPage;