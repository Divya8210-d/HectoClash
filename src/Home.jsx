import React, { useState,useEffect } from 'react'
import HectoClashLogo from './assets/HectoClashLogo.png';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { app } from './firebase';
import animation2 from './assets/animation2.mp4';
import classic from './assets/classic.png'
import twoplayer from './assets/twoplayer.png'
import tournament from './assets/tournament.png'

const auth = getAuth(app)
const db = getFirestore(app);

const Home = () => {
  const navigate = useNavigate()
  const [enter,setEnter] =useState("Let's Begin")
  const [inout,setInout] =useState("/login")


  useEffect(() => {
    if(localStorage.getItem("loggeduser")){
      setEnter("Logout")
    
    }

  });
  async function Play() {
    const email = localStorage.getItem("loggeduser");
  
    if (!email) {
      alert("Please login");
      return;
    }
  
    const userQuery = query(collection(db, "users"), where("PlayerEmail", "==", email));
    const userSnapshot = await getDocs(userQuery);
  
    if (userSnapshot.empty) {
      alert("User not found in database");
      return;
    }
  
    const userData = userSnapshot.docs[0].data();
  
    // Get current waiting list
    const waitingSnapshot = await getDocs(collection(db, "waiting"));
    const alreadyWaiting = waitingSnapshot.docs.some(doc => doc.data().Email === email);
  
    if (alreadyWaiting) {
      alert("You are already in the waiting room. Please wait.");
      return;
    }
  
    if (!waitingSnapshot.empty) {
      const opponent = waitingSnapshot.docs[0];
      try {
        alert("Connecting match...");
        const matchRef = await addDoc(collection(db, "match"), {
          Player1: userData.Playername,
          Email1: userData.PlayerEmail,
          Player2: opponent.data().Name,
          Email2: opponent.data().Email,
        });
  
        localStorage.setItem("matchid", matchRef.id);
        navigate("/game");
        await deleteDoc(doc(db, "waiting", opponent.id));
      } catch (e) {
        console.error("Error creating match:", e);
      }
    } else {
      // No one is waiting — add this player and start 2-min timeout
      try {
        alert("Waiting for a player...");
  
        const addedDocRef = await addDoc(collection(db, "waiting"), {
          Name: userData.Playername,
          Email: userData.PlayerEmail,
          createdAt: Date.now()
        });
  
        // Listen for a match involving this user
        const matchQuery = query(collection(db, "match"));
        const unsubscribe = onSnapshot(matchQuery, (snapshot) => {
          snapshot.forEach((docSnap) => {
            const matchData = docSnap.data();
            if (
              (matchData.Email1 === email || matchData.Email2 === email) &&
              matchData.Email1 && matchData.Email2
            ) {
              localStorage.setItem("matchid", docSnap.id);
              unsubscribe();
              clearTimeout(timeoutId); // stop the timeout when matched
              navigate("/game");
            }
          });
        });
  
        // ⏱ Set timeout to remove user after 2 minutes
        const timeoutId = setTimeout(async () => {
          // Double-check still not matched (edge case)
          let matchFound = false;
          const matchCheck = await getDocs(collection(db, "match"));
          matchCheck.forEach(docSnap => {
            const m = docSnap.data();
            if (m.Email1 === email || m.Email2 === email) {
              matchFound = true;
            }
          });
  
          if (!matchFound) {
            await deleteDoc(addedDocRef);
            unsubscribe(); // stop listening for matches
            alert("No player found. Please try again later.");
          }
        }, 2 * 60 * 1000); // 2 minutes
      } catch (e) {
        console.error("Error adding to waiting room:", e);
      }
    }
  }
  

  return (
    <>
      <div className='min-h-screen w-full overflow-x-hidden bg-[#0d1332] p-4'>
     
       <nav className="bg-gradient-to-r from-[#0d1332] to-[#09B2DE] flex flex-col lg:flex-row lg:items-center justify-between px-6 py-2 mt-2 rounded-xl gap-2">
               <img
                 src={HectoClashLogo}
                 alt="HectoClash Logo"
                 className="h-10 sm:h-12 md:h-14 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] mx-auto lg:mx-0 lg:ml-[60px] sm:ml-[10px] object-contain"
               />
       
               {/* Desktop layout: flex-row; Mobile layout: stacked */}
               <div className="flex flex-col w-full lg:flex-row lg:items-center lg:justify-end gap-2">
                 <ul className="flex flex-wrap justify-center gap-4 lg:gap-[50px] text-white lg:text-lg sm:text-base lg:mr-[50px] sm:mr-[0px]">
                   <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/game")}>
                     Home
                   </li>
                   <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/leader")}>
                     Leaderboard
                   </li>
                 
                   <li
                     className="hover:text-green-400 cursor-pointer"
                     onClick={async () => {
                       signOut(auth);
                       const email = localStorage.getItem("loggeduser");
                       if (email) {
                         const q = query(collection(db, "users"), where("PlayerEmail", "==", email));
                         const Deletedoc = await getDocs(q);
                         if (!Deletedoc.empty) {
                           const current = Deletedoc.docs[0].id;
                           await deleteDoc(doc(db, "users", current));
                           alert("Account deleted");
                           localStorage.removeItem("loggeduser");
                           navigate("/");
                         }
                       } else {
                         alert("Please login to delete your account.");
                       }
                     }}
                   >
                     Delete Account
                   </li>
                 </ul>
       
                 {/* Appears below nav items on mobile; same line on desktop */}
                 <div className="flex justify-center lg:justify-end w-full lg:w-auto mt-2 lg:mt-0">
                   <NavLink
                     to={inout}
                     className="bg-[#0F1638] text-[#6EFE3B] px-6 py-2 rounded-full font-semibold hover:opacity-80"
                   >
                     {enter}
                   </NavLink>
                 </div>
               </div>
             </nav>

        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 mt-20 px-4 overflow-x-hidden">
          <video
            src={animation2}
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-[550px] h-auto"
          />
          <div className='w-full max-w-[661px] text-center lg:text-left flex flex-col font-Rajdhani gap-[33px] justify-center'>
            <span className='bg-gradient-to-r from-[#00CAFF] to-[#6EFE3B] bg-clip-text text-transparent text-4xl md:text-5xl lg:text-6xl'>
              Your daily dose of Mental Math Puzzles
            </span>
            <span className='text-[#FFFFFF] text-[18px] md:text-[20px] lg:text-[22px]'>
              Test your speed and skills in a real-time game arena head to head against fellow mathematics enthusiasts
            </span>
            <button onClick={Play} className='bg-[#6EFE3B] w-[142px] h-[42px] self-center lg:self-start rounded-3xl text-base font-semibold'>Play 1v1</button>
          </div>
        </div>

        <div className='text-center mt-20 lg:mt-[100px]'>
          <span className='text-[#6EFE3B] text-3xl md:text-4xl lg:text-[48px] font-semibold'>POPULAR GAME MODES</span>
          <hr className='mt-4 mx-auto w-3/4 border-t border-gray-300' />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 p-3 mt-10">
          <div className="bg-gradient-to-r from-[#85d269] to-[#0F1638]   rounded-2xl shadow-md p-8 m-2 hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4 "><img src={classic} className='ml-[60px]' /></div>
            <h2 className=" font-bold mb-2 text-white text-center text-2xl">Classic 1V1</h2>
            <p className="text-gray-300">Use given digits in the provided order and perform basic arithmetic operations to achieve the number ‘100’</p>
          </div>

          <div className="bg-gradient-to-r from-[#85d269] to-[#0F1638] rounded-2xl shadow-md p-8 m-2 hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4"><img src={twoplayer} className='ml-[60px]' /></div>
            <h2 className="text-2xl font-bold mb-2 text-white text-center">Double Trouble</h2>
            <p className="text-gray-300">Team up with a friend to compete against
              other teams in a Hectoc style game format.</p>
          </div>

          <div className="bg-gradient-to-r from-[#85d269] to-[#0F1638] rounded-2xl shadow-md p-8 m-2 hover:shadow-xl transition duration-300">
            <div className="text-4xl mb-4"><img src={tournament} className='ml-[60px]' /></div>
            <h2 className="text-2xl font-bold mb-2 text-white">Tournament</h2>
            <p className="text-gray-300">10 Minutes, 5 Battles, 1 Ultimate Champion.
              Big Risks. Bigger Rewards</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home;
