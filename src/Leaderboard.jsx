import React, { useEffect, useState } from 'react';
import { app } from './firebase';
import HectoClashLogo from './assets/HectoClashLogo.png';
import { NavLink,useNavigate} from 'react-router';
import { getFirestore,getDocs,getDoc ,collection,query,where,deleteDoc} from 'firebase/firestore';

import { getAuth,signOut } from 'firebase/auth';

const db = getFirestore(app)
const auth = getAuth(app)








const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const navigate =useNavigate()

async function getuser(params) {

  const users= await getDocs(collection(db,"users"))
  setPlayers(users.docs)

  
  
}






  useEffect(() => {
   getuser()
   
  }, []); 
 
  return (
    <div className="min-h-screen w-screen bg-[#0B0E2D] p-4 overflow-x-hidden">
  <nav className="bg-gradient-to-r from-[#0B0E2D] to-[#09B2DE] flex flex-col lg:flex-row lg:items-center justify-between px-6 py-4 rounded-xl gap-4">
    
    {/* Logo */}
    <img src={HectoClashLogo} className="h-10 sm:h-12 lg:ml-[60px] sm:ml-[10px]" alt="HectoClash Logo" />

    {/* Nav links + login */}
    <div className="flex flex-col lg:flex-row items-center justify-end gap-6 text-white text-base sm:text-lg w-full lg:w-auto">
      <ul className="flex flex-wrap justify-center gap-6 lg:gap-[40px] items-center sm:ml-[60px]">
        <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/result")}>Home</li>
        <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/leader")}>Leaderboard</li>
        <li className="hover:text-green-400 cursor-pointer">Multiplayer</li>
        <li className="hover:text-green-400 cursor-pointer" onClick={async () => {
          signOut(auth);
          const email = localStorage.getItem("loggeduser");

          if (email) {
            const q = query(collection(db, "users"), where("PlayerEmail", "==", email));
            const Deletedoc = await getDocs(q);

            if (!Deletedoc.empty) {
              const current = Deletedoc.docs[0].id;
              await deleteDoc(doc(db, "users", current));
              alert("Account deleted");
            }
          }
        }}>Delete Account</li>
        <li className="hover:text-green-400 cursor-pointer" onClick={async () => {
          try {
            signOut(auth);
            localStorage.removeItem("loggeduser");
            alert("Logged out successfully");
          } catch (error) {
            console.log(error);
          }
        }}>Logout</li>
      </ul>

      <NavLink
        to="/login"
        className="bg-[#0F1638] text-[#6EFE3B] px-6 py-2 rounded-full font-semibold hover:opacity-80 lg:ml-[70px] sm:ml-[2px]"
      >
        Login
      </NavLink>
    </div>
  </nav>
  <div className="w-full min-h-screen max-w-md md:max-w-xl rounded-2xl shadow-lg p-6  bg-gradient-to-r from-[#29F19C] to-[#00D1FF]  relative lg:top-[40px]   lg:left-[445px] md:left-[120px] md:top-[60px] sm:left-[110px] sm:top-[80px]">
        <h1 className="text-white text-2xl md:text-3xl font-bold text-center mb-6 tracking-wide  bg-[#001E3C] ">
          CURRENT WORLD LEADERBOARD
        </h1>
        <div className="space-y-4">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3  rounded-xl  bg-[#001E3C]"
            >
              <div className="flex items-center space-x-3">
                <span className="text-white text-lg">{index + 1}.</span>
                <span className="text-white">{player.data().Playername}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                <span className="text-whitefont-bold text-lg text-white">{player.data().Totalpoint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>





</div>

  );
};

export default Leaderboard;
/*
     */