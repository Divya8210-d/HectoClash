import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  runTransaction,
  updateDoc,
  increment,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { app } from './firebase';
import { useNavigate } from 'react-router';
import { evaluate } from 'mathjs';

const db = getFirestore(app);

function findExpressionsFor100(digits) {
  const results = new Set();
  const operators = ['+', '-', '*', '/'];

  function buildNumberCombos(index, current) {
    if (index === digits.length) return [current];
    const combos = [];
    for (let i = 1; i <= 2 && index + i <= digits.length; i++) {
      const num = digits.slice(index, index + i).join('');
      combos.push(...buildNumberCombos(index + i, [...current, num]));
    }
    return combos;
  }

  function insertOperators(nums) {
    const expressions = [];
    function backtrack(i, expr) {
      if (i === nums.length) {
        expressions.push(expr);
        return;
      }
      for (let op of operators) {
        backtrack(i + 1, `${expr}${op}${nums[i]}`);
      }
    }
    backtrack(1, nums[0]);
    return expressions;
  }

  function addParentheses(expr) {
    const tokens = expr.match(/\d+|[+\-*/]/g);
    if (!tokens || tokens.length < 3) return [expr];
    const memo = new Map();
    function generate(start, end) {
      const key = `${start},${end}`;
      if (memo.has(key)) return memo.get(key);
      if (start === end) return [tokens[start]];
      const res = [];
      for (let i = start + 1; i < end; i += 2) {
        const op = tokens[i];
        const leftParts = generate(start, i - 1);
        const rightParts = generate(i + 1, end);
        for (let l of leftParts) {
          for (let r of rightParts) {
            res.push(`(${l}${op}${r})`);
          }
        }
      }
      memo.set(key, res);
      return res;
    }
    return generate(0, tokens.length - 1);
  }

  const numberCombos = buildNumberCombos(0, []);
  for (let nums of numberCombos) {
    const exprs = insertOperators(nums);
    for (let expr of exprs) {
      const withParen = addParentheses(expr);
      for (let pExpr of withParen) {
        try {
          const val = evaluate(pExpr);
          if (Math.abs(val - 100) < 1e-6) {
            results.add(pExpr);
          }
        } catch {}
      }
    }
  }

  return results.size ? [...results] : ['No solution found'];
}

const Game = () => {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [digits, setDigits] = useState([]);
  const [answer, setAnswer] = useState('');
  const navigate = useNavigate();

  async function display() {
    const email = localStorage.getItem('loggeduser');
    const q1 = query(collection(db, 'match'), where('Email1', '==', email));
    const Matchdoc1 = await getDocs(q1);
    const q2 = query(collection(db, 'match'), where('Email2', '==', email));
    const Matchdoc2 = await getDocs(q2);

    if (!Matchdoc1.empty) {
      setUser1(Matchdoc1.docs[0].data().Player1);
      setUser2(Matchdoc1.docs[0].data().Player2);
    } else if (!Matchdoc2.empty) {
      setUser1(Matchdoc2.docs[0].data().Player1);
      setUser2(Matchdoc2.docs[0].data().Player2);
    } else {
      alert('No match is going on.');
    }
  }

  function generateDigits() {
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    return digits.slice(0, 6);
  }

  useEffect(() => {
    async function initializeGame() {
      const email = localStorage.getItem('loggeduser');
      const matchId = localStorage.getItem('matchid');
      if (!email || !matchId) {
        alert("Missing match or user info");
        return;
      }

      await display();

      const matchRef = doc(db, 'match', matchId);
      const matchSnap = await getDoc(matchRef);

      if (matchSnap.exists()) {
        const data = matchSnap.data();
        if (data.digits && data.digits.length === 6) {
          setDigits(data.digits);
          localStorage.setItem('gameDigits', JSON.stringify(data.digits));
          return;
        }
      }

      let number = generateDigits();
      while (findExpressionsFor100(number)[0] === 'No solution found') {
        number = generateDigits();
      }

      await updateDoc(matchRef, { digits: number });
      localStorage.setItem('gameDigits', JSON.stringify(number));
      setDigits(number);
    }

    initializeGame();
  }, []);

  // ✅ Real-time listener to detect when result is set
  useEffect(() => {
    const matchId = localStorage.getItem('matchid');
    if (!matchId) return;

    const resultRef = doc(db, 'results', matchId);

    const unsubscribe = onSnapshot(resultRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.winnerId) {
          localStorage.setItem('currentwinner', data.winnerId);
          navigate('/result');
        }
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const matchId = localStorage.getItem('matchid');
    if (!matchId) return;
  
    const matchRef = doc(db, 'match', matchId);
  
    const unsubscribe = onSnapshot(matchRef, (docSnap) => {
      //
      if (!docSnap.exists()) {
        alert('Match ended by opponent.');
        localStorage.removeItem('gameDigits');
        localStorage.removeItem('matchid');
        navigate('/');
      }
    });
  
    return () => unsubscribe();
  }, []);
  












  function check(e) {
    e.preventDefault();
  
    const originalDigits = digits.map(String); // original digits as strings
    const allAvailable = [...originalDigits];
  
    // Extract only the digit characters from the user's input
    const digitChars = answer.replace(/[^0-9]/g, '');
  
    // Early return if the number of digits doesn't match
    if (digitChars.length !== allAvailable.length) {
      alert("❌ You must use all the given digits exactly once.");
      return;
    }
  
    // Create a sorted copy for easy comparison
    const usedDigitsSorted = digitChars.split('').sort().join('');
    const originalSorted = allAvailable.sort().join('');
  
    if (usedDigitsSorted !== originalSorted) {
      alert("❌ You used digits not from the given set or reused digits.");
      return;
    }
  
    // Try to evaluate the expression
    try {
      const evalanswer = evaluate(answer);
      if (evalanswer == 100) {
        alert('✅ Yes! It is 100');
      } else {
        alert('❌ Try again');
      }
    } catch (error) {
      alert('⚠️ Invalid expression');
    }
  }
  
  async function submit() {
    const matchId = localStorage.getItem('matchid');
    const playerId = localStorage.getItem('loggeduser');
    const resultRef = doc(db, "results", matchId);

    try {
      const result = await runTransaction(db, async (transaction) => {
        const resultDoc = await transaction.get(resultRef);

        if (!resultDoc.exists()) {
          transaction.set(resultRef, {
            winnerId: playerId,
            submittedAt: Date.now()
          });
          return { winner: true, winnerId: playerId };
        } else {
          return { winner: false, winnerId: resultDoc.data().winnerId };
        }
      });

      if (result.winner) {
        alert("You're the winner!");
        localStorage.setItem("currentwinner", result.winnerId);
        const userdoc = query(collection(db, 'users'), where('PlayerEmail', '==', result.winnerId));
        const userdoc1 = await getDocs(userdoc);
        const userRef = doc(db, "users", userdoc1.docs[0].id);
        await updateDoc(userRef, {
          Matchplayed: increment(1),
          Totalpoint: increment(100),
          Matchwon: increment(1)
        });
      
      } else {
        const userdoc = query(collection(db, 'users'), where('PlayerEmail', '==', result.winnerId));
        const userdoc1 = await getDocs(userdoc);
        const userRef = doc(db, "users", userdoc1.docs[0].id);
        await updateDoc(userRef, {
          Matchplayed: increment(1),
          Matchlost: increment(1)
        });
      }

    } catch (e) {
      console.error("Transaction failed:", e);
    }
  }

async function endmatch() {
const check =confirm("Do you want to end the match?")
if(check==false){return;}


  const email = localStorage.getItem('loggeduser');
  const q1 = query(collection(db, 'match'), where('Email1', '==', email));
  const Matchdoc1 = await getDocs(q1);
  const q2 = query(collection(db, 'match'), where('Email2', '==', email));
  const Matchdoc2 = await getDocs(q2);

  if (!Matchdoc1.empty) {
    await deleteDoc(doc(db, 'match', Matchdoc1.docs[0].id));
  } else if (!Matchdoc2.empty) {
    await deleteDoc(doc(db, 'match', Matchdoc2.docs[0].id));
  }

  localStorage.removeItem('gameDigits');
  localStorage.removeItem('matchid');
  
  navigate('/');


  
}
async function draw() {

  
  
    const email = localStorage.getItem('loggeduser');
    const q1 = query(collection(db, 'match'), where('Email1', '==', email));
    const Matchdoc1 = await getDocs(q1);
    const q2 = query(collection(db, 'match'), where('Email2', '==', email));
    const Matchdoc2 = await getDocs(q2);
  
    if (!Matchdoc1.empty) {
      await deleteDoc(doc(db, 'match', Matchdoc1.docs[0].id));
    } else if (!Matchdoc2.empty) {
      await deleteDoc(doc(db, 'match', Matchdoc2.docs[0].id));
    }
  
    localStorage.removeItem('gameDigits');
    localStorage.removeItem('matchid');
    
    navigate('/');
  
  
    
  }

const [timeLeft, setTimeLeft] = useState(300); 

useEffect(() => {
  if (timeLeft <= 0) {
    alert("Time's up! No Winner");
  draw()
    return;
  }

  const interval = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [timeLeft]);









  return (
    <div className="min-h-screen w-full bg-[#0F1638] overflow-x-hidden px-4 sm:px-6 pb-10">
      <nav className="bg-gradient-to-r from-[#0F1638] to-[#09B2DE] flex flex-col lg:flex-row relative px-4 sm:px-8 py-4 shadow-md w-full max-w-[1400px] mx-auto rounded-xl mt-4 z-30 gap-4">
        <button
          onClick={endmatch}
          className="bg-[#D1362B] text-white px-6 py-2 rounded-full font-semibold hover:opacity-80"
        >
          Exit
        </button>
        <h1 className="text-white text-center text-sm sm:text-lg lg:text-xl relative lg:left-[190px] sm:left-[20px] md:left-[50px]">
          Use the given digits and apply basic mathematical operations  to obtain the result as ‘100’
        </h1>
      </nav>
      <div className="flex gap-4 justify-center mt-6 relative top-[60px]">
  <div className="p-4 w-[80px] h-16 bg-[#6EFE3B] rounded-lg shadow-md text-black text-2xl flex items-center justify-center">
    {Math.floor(timeLeft / 60)}
  </div>
  <span className="text-white text-5xl font-bold leading-[4rem]">:</span>
  <div className="p-4 w-[80px] h-16 bg-[#6EFE3B] rounded-lg shadow-md text-black text-2xl flex items-center justify-center">
    {String(timeLeft % 60).padStart(2, '0')}
  </div>
</div>

<div className="flex flex-col sm:flex-row justify-between items-center max-w-[1200px] mx-auto mt-10 gap-6 relative top-[70px]">
  {/* Player 1 */}
  <div className="flex flex-col items-center gap-2">
    <div className='w-full min-w-[180px] aspect-[1.13] rounded-[13px] border-[6px] border-[#6EFE3B] flex items-center justify-center bg-transparent'>
      <svg width='60' height='60' viewBox='0 0 64 64' fill='#6EFE3B' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='32' cy='20' r='12' />
        <path d='M12 52c0-11 9-16 20-16s20 5 20 16v4H12v-4z' />
      </svg>
    </div>
    <div className="border-4 border-green-500 rounded-lg px-6 py-3 text-green-500 text-xl min-w-[180px] text-center">
      {user1}
    </div>
  </div>

  {/* VS text */}
  <span className="text-6xl sm:text-7xl text-transparent bg-gradient-to-r from-[#6EFE3B] to-[#00CAFF] bg-clip-text font-bold">
    VS
  </span>

  {/* Player 2 */}
  <div className="flex flex-col items-center gap-2">
    <div className='w-full min-w-[180px] aspect-[1.13] rounded-[13px] border-[6px] border-[#00CAFF] flex items-center justify-center bg-transparent'>
      <svg width='60' height='60' viewBox='0 0 64 64' fill='#00CAFF' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='32' cy='20' r='12' />
        <path d='M12 52c0-11 9-16 20-16s20 5 20 16v4H12v-4z' />
      </svg>
    </div>
    <div className="border-4 border-[#00CAFF] rounded-lg px-6 py-3 text-[#00CAFF] text-xl min-w-[180px] text-center">
      {user2}
    </div>
  </div>
</div>

      <div className="flex flex-wrap justify-center gap-4 text-3xl font-bold mt-12 relative top-[40px]">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="p-4 w-16 h-16 flex items-center justify-center bg-[#6EFE3B] rounded-lg shadow-md text-black text-2xl"
          >
            {digit}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-16 relative top-[40px]">
  <form
    onSubmit={check}
    className="flex flex-col items-center gap-4 w-full px-4 max-w-[460px]"
  >
    <input
      type="text"
      value={answer}
      onChange={(e) => setAnswer(e.target.value)}
      placeholder="Give your Answer"
      className="w-[280px] sm:w-full h-[48px] bg-[#BDEEFA] text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        type="submit"
        className="bg-[#6EFE3B] text-black px-4 py-2 rounded-full font-semibold hover:opacity-80 w-[120px]"
      >
        Check
      </button>
      <button
        type="button"
        onClick={submit}
        className="bg-[#6EFE3B] text-black px-4 py-2 rounded-full font-semibold hover:opacity-80 w-[120px]"
      >
        Submit
      </button>
    </div>
  </form>
</div>

    </div>
  );
};

export default Game;
