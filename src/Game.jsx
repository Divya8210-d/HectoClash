import React, { useEffect, useState } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,runTransaction,updateDoc,increment,getDoc
} from 'firebase/firestore';
import { app } from './firebase';
import { useNavigate } from 'react-router';
import { evaluate } from 'mathjs';

const db = getFirestore(app);


function findExpressionsFor100(digits) {
  const results = new Set();
  const operators = ['+', '-', '*', '/'];

  // Step 1: Build all groupings of digits (e.g., ['2', '9', '53', '74'])
  function buildNumberCombos(index, current) {
    if (index === digits.length) return [current];
    const combos = [];
    for (let i = 1; i <= 2 && index + i <= digits.length; i++) {
      const num = digits.slice(index, index + i).join('');
      combos.push(...buildNumberCombos(index + i, [...current, num]));
    }
    return combos;
  }

  // Step 2: Insert operators between numbers
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

  // Step 3: Add parentheses recursively
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

  // Step 4: Full solution search
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
        } catch {
          // Skip invalid expressions
        }
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
          console.log('📥 Synced digits from Firestore:', data.digits);
          return;
        }
      }
  
      // Generate new solvable digits
      let number = generateDigits();
      while (findExpressionsFor100(number)[0] === 'No solution found') {
        number = generateDigits();
      }
  
      console.log('✔ Solvable Digits:', number);
      console.log('➡ Sample Solution:', findExpressionsFor100(number)[0]);
  
      // Update Firestore and localStorage
      await updateDoc(matchRef, { digits: number });
      localStorage.setItem('gameDigits', JSON.stringify(number));
      setDigits(number);
    }
  
    initializeGame();
  }, []);

  async function abort() {
    const email = localStorage.getItem('loggeduser');
    const q1 = query(collection(db, 'match'), where('Email1', '==', email));
    const Matchdoc1 = await getDocs(q1);
    const q2 = query(collection(db, 'match'), where('Email2', '==', email));
    const Matchdoc2 = await getDocs(q2);

    if (!Matchdoc1.empty) {
      await deleteDoc(doc(db, 'match', Matchdoc1.docs[0].id));
    } else if (!Matchdoc2.empty) {
      await deleteDoc(doc(db, 'match', Matchdoc2.docs[0].id));
    } else {
      alert('Error ending match');
    }

    localStorage.removeItem('gameDigits');
    localStorage.removeItem('matchid');
    const winner =localStorage.getItem("currentwinner")
    const result = query(collection(db, 'results'), where('winnerId', '==', winner));
    
    const resultdoc = await getDocs(result);
    await deleteDoc(doc(db, 'results', resultdoc.docs[0].id));
    navigate('/');
  }

  






  function check(e) {
    e.preventDefault();
    try {
      const evalanswer = evaluate(answer);
      if (evalanswer == 100) {
        alert('✅yes it is 100');
      } else {
        alert('❌ Try again');
      }
    } catch (error) {
      alert('⚠️ Invalid expression');
    }
  }



async function submit() {
  const matchId = localStorage.getItem('matchid')
const playerId = localStorage.getItem('loggeduser');



  const resultRef = doc(db, "results", matchId);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const resultDoc = await transaction.get(resultRef);
      
      if (!resultDoc.exists()) {
        // No winner yet → you're the winner!
        transaction.set(resultRef, {
          winnerId: playerId,
          submittedAt: Date.now()
        });
        return { winner: true , winnerId: playerId };
      } else {
        // Someone already submitted
        return { winner: false, winnerId: resultDoc.data().winnerId };
      }
    });

    if (result.winner) {
      alert("You're the winner!");
      localStorage.setItem("currentwinner",result.winnerId)
      const userdoc = query(collection(db, 'users'), where('PlayerEmail', '==',result.winnerId));
      const userdoc1 = await getDocs(userdoc);
      const userRef = doc(db, "users",userdoc1.docs[0].id);
      if (!userdoc1.empty) {
        console.log("Updating user:", userdoc1.docs[0].id);
      } else {
        console.error("User not found in users collection");
      }

await updateDoc(userRef, {
  Matchplayed:increment(1),
  Totalpoint:increment(100),
  Matchwon:increment(1)
  
});
      
setTimeout(()=>{abort()},8000)
      navigate("/result")
     
    } 

else{
  const userdoc = query(collection(db, 'users'), where('PlayerEmail', '==',result.winnerId));
  const userdoc1 = await getDocs(userdoc);
  const userRef = doc(db, "users",userdoc1.docs[0].id);
  if (!userdoc1.empty) {
    console.log("Updating user:", userdoc1.docs[0].id);
  } else {
    console.error("User not found in users collection");
  }
  

await updateDoc(userRef, {
Matchplayed:increment(1),
Matchlost:increment(1)

});

}



  } catch (e) {
    console.error("Transaction failed:", e);
  }


  
}




  return (
    <div className="min-h-screen w-full bg-[#0F1638] overflow-x-hidden px-4 sm:px-6 pb-10">
      <nav className="bg-gradient-to-r from-[#0F1638] to-[#09B2DE] flex flex-col lg:flex-row relative px-4 sm:px-8 py-4 shadow-md w-full max-w-[1400px] mx-auto rounded-xl mt-4 z-30 gap-4">
        <button
          onClick={abort}
          className="bg-[#D1362B] text-white px-6 py-2 rounded-full font-semibold hover:opacity-80"
        >
          Exit
        </button>
        <h1 className="text-white text-center text-sm sm:text-lg lg:text-xl relative lg:left-[190px] sm:left-[20px] md:left-[50px]">
          Use the given digits and apply basic mathematical operations to obtain the result as ‘100’
        </h1>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-center max-w-[1200px] mx-auto mt-10 gap-6">
        <div className="border-4 border-green-500 rounded-lg px-6 py-3 text-green-500 text-xl min-w-[180px] text-center relative top-[180px]">
          {user1}
        </div>
        <span className="text-6xl sm:text-7xl text-transparent bg-gradient-to-r from-[#6EFE3B] to-[#00CAFF] bg-clip-text font-bold relative top-[170px]">
          VS
        </span>
        <div className="border-4 border-[#00CAFF] rounded-lg px-6 py-3 text-[#00CAFF] text-xl min-w-[180px] text-center relative top-[180px]">
          {user2}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-3xl font-bold mt-12 relative top-[220px]">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="p-4 w-16 h-16 flex items-center justify-center bg-[#6EFE3B] rounded-lg shadow-md text-black text-2xl"
          >
            {digit}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-16 relative top-[190px]">
        <form className="flex flex-col" onSubmit={check}>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Give your Answer"
            className="lg:w-[460px] sm:w-[400px] h-[56px] bg-[#BDEEFA] text-black border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-[#6EFE3B] text-black px-6 py-2 rounded-full font-semibold hover:opacity-80 mt-[15px] w-[120px] relative left-[170px]"
          >
            Check
          </button>
         
        </form>
        <button
            onClick={submit}
            className="bg-[#6EFE3B] text-black px-6 py-2 rounded-full font-semibold hover:opacity-80 mt-[15px] w-[120px] relative left-[170px]"
          >
            submit
          </button>
      </div>
    </div>
  );
};

export default Game;
