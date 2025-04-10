  import React, { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { Link } from "react-router-dom";
  import bg from "../images/mainbg.jpg";

  import {
    HomeIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    MagnifyingGlassIcon,
    PlusCircleIcon,
  } from "@heroicons/react/24/solid";

  export const LevelUp = () => {
    const [query, setQuery] = useState("");
    const [showSuggest, setShowSuggest] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ subject: "", link: "" });
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    // 🟢 Fetch resources from backend on mount
    useEffect(() => {
      const fetchResources = async () => {
        try {
          const res = await fetch("http://localhost:8000/psg4u/resources/");
          const data = await res.json();
          setSubjects(data);
        } catch (error) {
          console.error("Failed to fetch subjects:", error);
        }
      };

      fetchResources();
    }, []);

    const handleSuggestSubmit = async () => {
      try {
        const res = await fetch("http://localhost:8000/psg4u/suggest-resource/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: newSubject.subject,  // ✅ FIXED this line
            link: newSubject.link,
            rollno: user.rollno
          }),
        });
    
        if (!res.ok) {
          const text = await res.text();
          console.error("Server error:", text);
          throw new Error("Failed to suggest resource.");
        }
    
        const data = await res.json();
    
        if (data.status === "accepted") {
          alert("✅ Resource accepted and added!");
          const updated = await fetch("http://localhost:8000/psg4u/resources/");
          const updatedData = await updated.json();
          setSubjects(updatedData);
          setNewSubject({ subject: "", link: "" });  // ✅ match the correct keys
          setShowSuggest(false);
        } else {
          alert("❌ Resource not relevant enough.");
        }
      } catch (error) {
        console.error("❌ Suggestion failed:", error.message);
        alert("Something went wrong while submitting the suggestion.");
      }
    };
    

    const filteredSubjects = subjects.filter((subj) =>
      subj.subject.toLowerCase().includes(query.toLowerCase())
    );

    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bg})` }}
      >
        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r mb-10 from-gray-900 via-gray-800 to-gray-900 px-10 py-4 shadow-md z-50 sticky top-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
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
            <div className="flex space-x-8 items-center gap-10">
              <Link
                to="/main"
                className="text-gray-300 hover:text-blue-400 flex items-center gap-1"
              >
                <HomeIcon className="w-5 h-5" />
                Home
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowSuggest(true)}
                className="flex items-center gap-2 bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Suggest
              </motion.button>
              <Link
                to="/"
                className="text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </Link>
            </div>
          </div>
        </nav>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center gap-2 bg-white shadow-md rounded-xl px-4 py-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subject..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full outline-none text-gray-700 py-2"
            />
          </div>
        </div>

        {/* Subject Cards */}
        <motion.div
          layout
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
        >
          {filteredSubjects.length > 0 ? (
            filteredSubjects.slice(0, 10).map((subject, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 h-[170px] backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-transform duration-300 ease-in-out"
              >
                <h3 className="text-xl font-semibold text-blue-500 mb-3 tracking-wide">
                  {subject.subject}
                </h3>
                <a
                  href={subject.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-sm text-gray-800 hover:text-blue-500 transition"
                >
                  🌐 Visit Resource
                </a>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-white/70 col-span-full mt-8">
              No matching subjects found.
            </p>
          )}
        </motion.div>

        {/* Suggest Modal */}
        {showSuggest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50"
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-12 w-[40%] relative"
            >
              <button
                onClick={() => setShowSuggest(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-red-500 transition"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-14 text-center">
                💡 Suggest a Resource
              </h3>

              <div className="space-y-5">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={newSubject.subject}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg mb-1 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                <input
                  type="text"
                  placeholder="Resource Link"
                  value={newSubject.link}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, link: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSuggestSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-lg transition"
                >
                  Submit Suggestion
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  };
