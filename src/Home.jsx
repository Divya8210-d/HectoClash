import React from 'react'
import HectoClashLogo from './assets/HectoClashLogo.png';
import { NavLink, Outlet ,useNavigate} from 'react-router';
import { getAuth ,createUserWithEmailAndPassword,signOut} from "firebase/auth";
import { getFirestore,collection,getDocs ,addDoc,deleteDoc,doc,query,where} from "firebase/firestore";
import { app } from './firebase';
import animation2 from'./assets/animation2.mp4';
import classic from './assets/classic.png'
import twoplayer from './assets/twoplayer.png'
import tournament from './assets/tournament.png'

const auth = getAuth(app)
const db= getFirestore(app);


const Home = () => {
const navigate =useNavigate()

async function Play() {
  const email = localStorage.getItem("loggeduser");
  const querySnapshot = await getDocs(collection(db, "waiting"));
  const q = query(collection(db, "users"), where("PlayerEmail", "==", email));
  const you = await getDocs(q);

  if(!email){
    alert("please login");
    return;
  }

  if(querySnapshot.empty){
    try {
      alert("wait till any player is available");
      await addDoc(collection(db, "waiting"), {
        Name: you.docs[0].data().Playername,
        Email: you.docs[0].data().PlayerEmail
      });
    } catch (e) {
      console.error("error in adding user ", e);
    }
  } else {
    async function setmatch() {
      alert("connecting match");
      const waitingplayer = querySnapshot.docs[0];
      try {
        const matchRef = await addDoc(collection(db, "match"), {
          Player1: you.docs[0].data().Playername,
          Email1: you.docs[0].data().PlayerEmail,
          Player2: waitingplayer.data().Name,
          Email2: waitingplayer.data().Email,
        });

        localStorage.setItem("matchid", matchRef.id);
        navigate("/game");
        await deleteDoc(doc(db, "waiting", waitingplayer.id));
      } catch (e) {
        console.error("error in creating match", e);
      }
    }
    setmatch();
  }
}

return (
  <>
    <div className='min-h-screen w-full overflow-x-hidden bg-[#0d1332] p-4'>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-[#0d1332] to-[#09B2DE] flex flex-col lg:flex-row lg:items-center justify-between px-6 py-4 rounded-xl gap-4">
        <img src={HectoClashLogo} className="h-10 sm:h-12 lg:ml-[60px] sm:ml-[10px]" alt="HectoClash Logo" />
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

      {/* Intro Statement & Video Side by Side */}
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

      {/* Popular Game Modes */}
      <div className='text-center mt-20 lg:mt-[100px]'>
        <span className='text-[#6EFE3B] text-3xl md:text-4xl lg:text-[48px] font-semibold'>POPULAR GAME MODES</span>
        <hr className='mt-4 mx-auto w-3/4 border-t border-gray-300' />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-10 mt-10">
        <div className="bg-gradient-to-r from-[#85d269] to-[#0F1638] rounded-2xl shadow-md p-6 m-2 hover:shadow-xl transition duration-300">
          <div className="text-4xl mb-4 "><img src={classic} className='ml-[60px]'/></div>
          <h2 className=" font-bold mb-2 text-white text-center text-2xl">Classic 1V1</h2>
          <p className="text-gray-300">Use given digits in the provided order and perform basic arithmetic operations to achieve the number ‘100’</p>
        </div>

        <div className="bg-gradient-to-r from-[#85d269] to-[#0F1638] rounded-2xl shadow-md p-6 m-2 hover:shadow-xl transition duration-300">
          <div className="text-4xl mb-4"><img src={twoplayer} className='ml-[60px]'/></div>
          <h2 className="text-2xl font-bold mb-2 text-white text-center">Double Trouble</h2>
          <p className="text-gray-300">Team up with a friend to compete against
          other teams in a Hectoc style game format.</p>
        </div>

        <div className="bg-gradient-to-r from-[#85d269] to-[#0F1638] rounded-2xl shadow-md p-6 m-2 hover:shadow-xl transition duration-300">
          <div className="text-4xl mb-4"><img src={tournament} className='ml-[60px]'/></div>
          <h2 className="text-2xl font-bold mb-2 text-white">Tournament</h2>
          <p className="text-gray-300">10 Minutes, 5 Battles, 1 Ultimate Champion.
          Big Risks. Bigger Rewards</p>
        </div>
      </div>
    </div>
  </>
)}

export default Home;
