import React, { useEffect, useState } from 'react';
import { app } from './firebase';
import HectoClashLogo from './assets/HectoClashLogo.png';
import { NavLink, useNavigate } from 'react-router';
import {
  getFirestore,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';

const db = getFirestore(app);
const auth = getAuth(app);

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);
  const [enter, setEnter] = useState("Let's Begin");
  const [inout, setInout] = useState("/login");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("loggeduser")) {
      setEnter("Logout");
    }
  }, []);

  useEffect(() => {
    async function getUser() {
      const users = await getDocs(collection(db, "users"));
      setPlayers(users.docs);
    }
    getUser();
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#0B0E2D] p-4 overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="bg-gradient-to-r from-[#0d1332] to-[#09B2DE] flex flex-col lg:flex-row lg:items-center justify-between px-6 py-2 mt-2 rounded-xl gap-2">
        <img
          src={HectoClashLogo}
          alt="HectoClash Logo"
          className="h-10 sm:h-12 md:h-14 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] mx-auto lg:mx-0 lg:ml-[60px] sm:ml-[10px] object-contain"
        />

        {/* Desktop layout: flex-row; Mobile layout: stacked */}
        <div className="flex flex-col w-full lg:flex-row lg:items-center lg:justify-end gap-2">
          <ul className="flex flex-wrap justify-center gap-4 lg:gap-[50px] text-white lg:text-lg sm:text-base lg:mr-[50px] sm:mr-[0px]">
            <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/")}>
              Home
            </li>
            <li className="hover:text-green-400 cursor-pointer" onClick={() => navigate("/leader")}>
              Leaderboard
            </li>
            <li className="hover:text-green-400 cursor-pointer">Watch Match</li>
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

      {/* LEADERBOARD */}
      <div className="w-full min-h-screen max-w-md md:max-w-xl rounded-2xl shadow-lg p-6 mt-6 sm:mt-10 bg-gradient-to-r from-[#29F19C] to-[#00D1FF] mx-auto">
        <h1 className="text-white text-2xl md:text-3xl font-bold text-center mb-6 tracking-wide bg-[#001E3C] py-2 rounded-lg">
          CURRENT WORLD LEADERBOARD
        </h1>
        <div className="space-y-4">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#001E3C]"
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
                <span className="text-white font-bold text-lg">{player.data().Totalpoint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
