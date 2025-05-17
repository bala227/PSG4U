import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bg from "../images/mainbg.jpg";
import {
  HomeIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import loadingAnimation from "../images/loading.json";
import Lottie from "react-lottie";
import { motion, AnimatePresence } from "framer-motion";

export const LevelUp = () => {
  const [query, setQuery] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({ subject: "", link: "" });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showPointsPopup, setShowPointsPopup] = useState({
    show: false,
    points: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [expandedSubject, setExpandedSubject] = useState(null);

  const toggleExpand = (subjectName) => {
    setExpandedSubject((prev) => (prev === subjectName ? null : subjectName));
  };
  // 🟢 Fetch resources from backend on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/psg4u/resources/");
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
      setIsLoading(true);

      const res = await fetch("http://127.0.0.1:8000/psg4u/suggest-resource/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.subject,
          link: newSubject.link,
          rollno: user.rollno,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", text);
        throw new Error("Failed to suggest resource.");
      }

      const data = await res.json();

      if (data.status === "accepted") {
        setShowPointsPopup({ show: true, points: data.points || 10 });
        setTimeout(() => setShowPointsPopup({ show: false, points: 0 }), 4000);

        const updated = await fetch("http://127.0.0.1:8000/psg4u/resources/");
        const updatedData = await updated.json();
        setSubjects(updatedData);
        setNewSubject({ subject: "", link: "" });
        setShowSuggest(false);
      } else {
        alert("❌ Resource not relevant enough.");
      }
    } catch (error) {
      console.error("❌ Suggestion failed:", error.message);
      alert("Something went wrong while submitting the suggestion.");
    } finally {
      setIsLoading(false); // ✅ always stop loader
    }
  };

  const groupedArray = Object.values(
    subjects.reduce((acc, curr) => {
      const key = curr.subject.trim().toLowerCase();
      if (!acc[key]) {
        acc[key] = {
          subject: curr.subject.trim(),
          links: [],
        };
      }
      acc[key].links.push({
        link: curr.link,
        summary: curr.summary || "", // fallback in case summary is missing
      });
      return acc;
    }, {})
  );

  const defaultOptions = {
    loop: true,
    autoplay: true, // Loop the animation
    animationData: loadingAnimation, // Your Lottie animation JSON
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Lottie options={defaultOptions} height={200} width={200} />
            <p>Verifying the Link..</p>
            <p>Please Wait 🧐🔍</p>
          </div>
        </div>
      )}
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
      {groupedArray.length == 0 && (
        <p className="text-center text-gray-700 mt-56">No Resources added yet.</p>
        )}
      <div className="max-w-5xl mx-auto space-y-6 px-4 pb-32">
        {groupedArray
          .filter((subject) =>
            subject.subject.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, query ? groupedArray.length : 6)
          .map((subject, index) => {
            const isExpanded = expandedSubject === subject.subject;
            const isSingle = subject.links.length === 1;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white/40 backdrop-blur-lg border border-white/30 shadow-lg rounded-xl ${
                  isSingle ? "p-6" : "p-3"
                }`}
              >
                {isSingle ? (
                  // ✅ Render directly if only one resource
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2 p-2">
                      {subject.subject}
                    </h3>
                    <div className="bg-white/60 p-6 rounded-lg shadow hover:shadow-md transition">
                      <a
                        href={subject.links[0].link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-medium text-lg hover:underline"
                      >
                        🌐 Resource
                      </a>
                      <p className="mt-2 text-gray-700 text-base line-clamp-4">
                        {subject.links[0].summary?.trim() ||
                          "No summary available."}
                      </p>
                    </div>
                  </div>
                ) : (
                  // ✅ Render collapsible box if multiple
                  <>
                    <button
                      onClick={() => toggleExpand(subject.subject)}
                      className="w-full text-left px-6 py-4 flex items-center justify-between text-blue-900 font-bold text-xl tracking-wide"
                    >
                      {subject.subject}
                      <span className="text-sm text-gray-600">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="px-6 pb-4 overflow-hidden space-y-4"
                        >
                          {subject.links.map((item, i) => (
                            <div
                              key={i}
                              className="bg-white/70 p-5 rounded-lg shadow flex flex-col hover:shadow-md transition"
                            >
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 font-semibold hover:underline text-base"
                              >
                                🌐 Resource {i + 1}
                              </a>
                              <p className="mt-2 text-gray-800 text-sm line-clamp-3">
                                {item.summary?.trim() ||
                                  "No summary available."}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })}
          {query === "" && groupedArray.length > 6 && (
            <div className="text-center mt-10 text-gray-700 text-lg">
              🔍 Search for more resources
            </div>
          )}

      </div>

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

      {/* Points Popup */}
      {showPointsPopup.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            exit={{ y: 30 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="bg-gradient-to-br from-green-500 to-blue-600 text-white px-10 py-8 rounded-3xl shadow-2xl text-center w-[350px] sm:w-[400px] md:w-[450px]"
          >
            <h2 className="text-3xl font-bold mb-4">🎉 Points Awarded!</h2>
            <p className="text-xl mb-6">
              You have earned{" "}
              <span className="font-semibold text-lg">
                {showPointsPopup.points}
              </span>{" "}
              points!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPointsPopup({ show: false, points: 0 })}
              className="text-white py-2 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 transition"
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
