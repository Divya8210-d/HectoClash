import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export const Result = () => {
  const [winner, setWinner] = useState('');
  const [loser, setLoser] = useState('');
  const [wpoint, setWpoint] = useState('');
  const [lpoint, setLpoint] = useState('');
  const [wacc, setWacc] = useState('');

  async function result() {
    const win = localStorage.getItem('currentwinner');
    const wuserdoc = query(collection(db, 'users'), where('PlayerEmail', '==', win));
    const winuserdoc1 = await getDocs(wuserdoc);
    const playedmatch = winuserdoc1.docs[0].data().Matchplayed;
    const playedwon = winuserdoc1.docs[0].data().Matchwon;

    setWinner(winuserdoc1.docs[0].data().Playername);
    setWpoint(winuserdoc1.docs[0].data().Totalpoint);
    if (playedmatch === 0 || playedmatch < playedwon) {
      setWacc(null);
    } else {
      setWacc(((playedwon / playedmatch) * 100).toFixed(2));
    }

    const q1 = query(collection(db, 'match'), where('Email1', '==', win));
    const Matchdoc1 = await getDocs(q1);
    const q2 = query(collection(db, 'match'), where('Email2', '==', win));
    const Matchdoc2 = await getDocs(q2);

    if (!Matchdoc1.empty) {
      const luserdoc = query(collection(db, 'users'), where('PlayerEmail', '==', Matchdoc1.docs[0].data().Email2));
      const loseuserdoc1 = await getDocs(luserdoc);
      setLpoint(loseuserdoc1.docs[0].data().Totalpoint);
      setLoser(Matchdoc1.docs[0].data().Player2);
    } else if (!Matchdoc2.empty) {
      const luserdoc = query(collection(db, 'users'), where('PlayerEmail', '==', Matchdoc2.docs[0].data().Email1));
      const loseuserdoc2 = await getDocs(luserdoc);
      setLpoint(loseuserdoc2.docs[0].data().Totalpoint);
      setLoser(Matchdoc2.docs[0].data().Player1);
    } else {
      alert('Error fetching result');
    }
  }

  useEffect(() => {
    result();
  }, []);

  return (
    <div className='min-h-screen w-screen bg-[#0B0E2D] p-4 overflow-x-hidden flex flex-col items-center'>
      <div className='flex flex-col lg:flex-row items-center justify-center gap-10 mt-10 w-full max-w-7xl px-4'>

     
        <div className='w-full max-w-xs flex flex-col items-center'>
          <h1 className='text-3xl sm:text-5xl text-white mb-4'>Loser</h1>
          <div className='w-full bg-[#0a0f2c] text-white rounded-2xl border-[6px] border-[#6EFE3B] p-4 flex flex-col items-center shadow-lg'>
            <div className='w-full max-w-[244px] aspect-[1.13] rounded-[13px] border-[6px] border-[#6EFE3B] flex items-center justify-center bg-transparent'>
              <svg width='120' height='120' viewBox='0 0 64 64' fill='#6EFE3B' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='32' cy='20' r='12' />
                <path d='M12 52c0-11 9-16 20-16s20 5 20 16v4H12v-4z' />
              </svg>
            </div>
            <h2 className='text-lg font-semibold text-[#6EFE3B] flex items-center gap-2 mt-3'>{loser}</h2>
            <div className='text-[#6EFE3B] text-xl mt-4 flex items-center gap-2'>
              <span className='text-white'>Points:</span> <span className='text-[#00CAFF]'>{lpoint}</span>
            </div>
            <div className='mt-4 text-sm space-y-1 text-center'>
              <p><span className='text-white'>Hectokens Gained:</span> <span className='text-[#6EFE3B]'>0</span></p>
            </div>
          </div>
        </div>


        <span className='text-5xl sm:text-6xl md:text-7xl text-transparent bg-gradient-to-r from-[#6EFE3B] to-[#00CAFF] bg-clip-text font-bold'>
          VS
        </span>

  
        <div className='w-full max-w-xs flex flex-col items-center'>
          <h1 className='text-3xl sm:text-5xl text-white mb-4'>Winner</h1>
          <div className='w-full bg-[#0a0f2c] text-white rounded-2xl border-[6px] border-[#00CAFF] p-4 flex flex-col items-center shadow-lg'>
            <div className='w-full max-w-[244px] aspect-[1.13] rounded-[13px] border-[6px] border-[#00CAFF] flex items-center justify-center bg-transparent'>
              <svg width='120' height='120' viewBox='0 0 64 64' fill='#00CAFF' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='32' cy='20' r='12' />
                <path d='M12 52c0-11 9-16 20-16s20 5 20 16v4H12v-4z' />
              </svg>
            </div>
            <h2 className='text-lg font-semibold text-[#00CAFF] flex items-center gap-2 mt-3'>{winner}</h2>
            <div className='text-[#6EFE3B] text-xl mt-4 flex items-center gap-2'>
              <span className='text-white'>Points:</span> <span>{wpoint}</span>
            </div>
            <div className='mt-4 text-sm space-y-1 text-center'>
              <p><span className='text-white'>Time Taken:</span> <span className='text-[#00CAFF]'></span></p>
              <p><span className='text-white'>Accuracy:</span> <span className='text-[#00CAFF]'>{wacc}</span></p>
              <p><span className='text-white'>Hectokens Gained:</span> <span className='text-[#00CAFF]'>100</span></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
