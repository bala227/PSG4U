import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import bg from "../images/mainbg.jpg";

export const Main = () => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [editingSemester, setEditingSemester] = useState(false);
  const [newSemester, setNewSemester] = useState(user?.semester || "");

  useEffect(() => {
    // Existing fetch for logged-in user
    fetch("http://127.0.0.1:8000/psg4u/me/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      });

    // New fetch for leaderboard users
    fetch("http://127.0.0.1:8000/psg4u/users/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => b.points - a.points); // Sort descending
        setLeaderboard(sorted);
      })
      .catch((err) => {
        console.error("Failed to fetch leaderboard:", err);
      });
  }, []);

  const myacc = () => {
    if (!show) {
      setShow(true);
      document.getElementById("sect").style.opacity = 0.3;
    }
  };

  const close = () => {
    if (show) {
      setShow(false);
      document.getElementById("sect").style.opacity = 1;
    }
  };
  const leaderboardRef = useRef(null);

  const scrollToLeaderboard = () => {
    setShow(false); // Close modal
    document.getElementById("sect").style.opacity = 1; // Reset main opacity
    leaderboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSemesterUpdate = () => {
    const semNum = parseInt(newSemester);

    if (semNum < 1 || semNum > 8 || isNaN(semNum)) {
      alert("Semester must be a number between 1 and 8");
      return;
    }

    fetch("http://127.0.0.1:8000/psg4u/update-semester/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ semester: semNum }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update semester");
        return res.json();
      })
      .then((data) => {
        setUser((prev) => ({ ...prev, semester: semNum }));
        setEditingSemester(false);
      })
      .catch((err) => {
        console.error("Error updating semester:", err);
        alert("Failed to update semester.");
      });
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      id="main"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-gray-800/20 z-0"></div>

      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-10 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-3"
          >
            <h1 className="text-2xl font-bold text-white tracking-wide">
              PSG<span className="text-blue-400">4U</span>
            </h1>
          </motion.div>

          {/* Navbar Links */}
          <div className="flex space-x-8 items-center gap-20">
            {/* Home */}
            <Link
              to="/main"
              className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition duration-200"
            >
              <HomeIcon className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            {/* My Account */}
            <button
              onClick={myacc}
              className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition duration-200"
            >
              <UserCircleIcon className="w-5 h-5" />
              <span className="font-medium">My Account</span>
            </button>
            {/* Leaderboard */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToLeaderboard}
              className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition duration-200"
            >
              <StarIcon className="w-5 h-5" />
              <span className="font-medium">Leaderboard</span>
            </motion.button>
            {/* Logout with special animation */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <Link
                to="/"
                className="flex items-center gap-2 text-red-400 hover:text-red-600 transition duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <section
        id="sect"
        className={`flex items-center justify-center p-10 pt-28 relative z-10 transition-opacity duration-300 ${
          show
            ? "opacity-30 pointer-events-none"
            : "opacity-100 pointer-events-auto"
        }`}
      >
        <div className="max-w-6xl h-[500px] w-full grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          {/* GPA Box */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl"
          >
            <Link
              to="/calculategpa"
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white rounded-xl shadow-xl p-10 flex flex-col items-center justify-center text-center h-full"
            >
              <StarIcon className="w-14 h-14 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Calculate GPA</h2>
              <p className="text-sm opacity-90">
                Easily calculate your semester GPA based on your subject grades
                and credits.
              </p>
            </Link>
          </motion.div>

          {/* Level Up Box */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl"
          >
            <Link
              to="/levelup"
              className="bg-gradient-to-br from-emerald-500 via-green-600 to-lime-500 text-white rounded-xl shadow-xl p-10 flex flex-col items-center justify-center text-center h-full"
            >
              <AcademicCapIcon className="w-14 h-14 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Level-Up Links</h2>
              <p className="text-sm opacity-90">
                Access curated learning resources to level up your academic and
                personal skills.
              </p>
            </Link>
          </motion.div>
        </div>
      </section>
      <section
        ref={leaderboardRef}
        className={`relative z-10 mt-20 px-4 md:px-10 ${
          show ? "opacity-30" : "opacity-100"
        } transition-opacity duration-300`}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-white mb-8 text-center"
        >
          🏆 PSG4U Leaderboard
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white/90 backdrop-blur-lg rounded-xl shadow-2xl p-6"
        >
          <div className="grid grid-cols-[1fr_2fr_1fr] text-gray-800 font-bold border-b pb-3 mb-3">
            <span>Rank</span>
            <span>Name</span>
            <span>Points</span>
          </div>

          {leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((user, index) => (
              <motion.div
                key={user.rollno || index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`grid grid-cols-[1fr_2fr_1fr] py-2 border-b last:border-none ${
                  index === 0
                    ? "text-yellow-600 font-semibold text-lg"
                    : "text-gray-700"
                }`}
              >
                <span>#{index + 1}</span>
                <span>{user.name}</span>
                <span>{user.points}</span>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-600 py-4">
              No users to display.
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 mt-20 relative z-10 text-center py-4 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 gap-24 flex justify-center items-center">
          {/* Left Section */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-lg font-semibold text-white">
              Done with 💙 by{" "}
              <span className="text-blue-400 font-semibold">
                Bala Subramanian
              </span>
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/bala227"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition duration-200"
              >
                <GitHubIcon />
              </a>

              {/* LinkedIn Icon */}
              <a
                href="https://www.linkedin.com/in/bala-subramanian-s-3a95a8261/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition duration-200"
              >
                <LinkedInIcon />
              </a>

              {/* Email Icon */}
              <a
                href="mailto:balasubramanian.s2000@gmail.com"
                className="text-gray-300 hover:text-blue-400 transition duration-200"
              >
               <EmailIcon />
              </a>
            </div>
          </div>

          {/* Right Section */}
          <div className="">
            <p className="text-sm mb-4 text-gray-400">
              <span className="text-red-500 font-bold">PSG4U</span> — Empowering
              students with the tools to succeed.
            </p>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} PSG4U. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {show && (
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="fixed top-24 right-32 bg-white shadow-2xl rounded-xl w-[420px] overflow-hidden z-50"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 relative flex flex-col items-center text-white">
            <button
              onClick={close}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-red-600 transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Avatar with First Letter */}
            <div className="w-20 h-20 rounded-full bg-white text-indigo-700 text-4xl font-bold flex items-center justify-center shadow-md mb-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
            </div>

            {/* User Details */}
            <h3 className="text-xl font-semibold mb-1">
              {user?.name || "Guest"}
            </h3>
            <p className="text-sm text-indigo-100 mb-1">
              {user?.rollno || "guest@psgtech.ac.in"}
            </p>
            <p className="text-sm text-indigo-200">
              Semester - {user?.semester || "1"}
            </p>
          </div>

          {/* Info Section */}
          <div className="p-6">
            {/* Points */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Points Earned:{" "}
                <span className="font-semibold text-gray-800">
                  {user?.points || "0"} pts
                </span>
              </p>

              <div className="flex justify-center items-center gap-2 mt-2">
                <StarIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-lg mt-1 font-bold text-gray-700">
                  {user?.points || "0"} Points
                </span>
              </div>
            </div>

            {editingSemester ? (
              <div className="flex flex-col items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSemesterUpdate}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition duration-200"
                >
                  Save Semester
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setEditingSemester(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition duration-200"
              >
                Edit Current Semester
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
