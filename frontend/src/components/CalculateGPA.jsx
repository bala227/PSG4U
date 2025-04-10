import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import bg from "../images/mainbg.jpg";

// Sample data for courses
const coursesPerSemester = {
  1: ["Maths", "Physics", "Chemistry", "English", "C Programming"],
  2: ["Mathematics II", "Electronics", "Data Structures", "Python", "EVS"],
  3: ["DBMS", "OOP", "Computer Networks", "OS", "Linear Algebra"],
  4: ["AI", "ML", "Web Development", "Cloud", "Data Science"],
};

export const CalculateGPA = () => {
  const [semester, setSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState({});
  const [gpa, setGpa] = useState(null);
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const selectedCourses = coursesPerSemester[semester] || [];
    setCourses(selectedCourses);

    // Initializes grades with default 5
    const initialGrades = {};
    selectedCourses.forEach((course) => {
      initialGrades[course] = 5;
    });
    setGrades(initialGrades);
  }, [semester]);

  const handleGradeChange = (course, value) => {
    const newGrades = { ...grades, [course]: parseFloat(value) };
    setGrades(newGrades);
  };

  const calculateGPA = () => {
    const gradeValues = Object.values(grades);
    const total = gradeValues.reduce((sum, val) => sum + val, 0);
    const average = gradeValues.length
      ? (total / gradeValues.length).toFixed(2)
      : 0;
    setGpa(average);
    setPrediction(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [strategyInputs, setStrategyInputs] = useState({
    ca1_marks: [25, 30, 27, 20, 28],
    current_cgpa: 7.0,
    expected_cgpa: 8.0,
  });

  const [prediction, setPrediction] = useState(null);

  const handlePrediction = async () => {
    setGpa(null); // Hides the GPA result box
    const res = await fetch("http://localhost:8000/psg4u/predict/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(strategyInputs),
    });

    const data = await res.json();
    setPrediction(data);
    setShowStrategyModal(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-10 py-4 shadow-md z-50 sticky top-0">
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
          <div className="flex space-x-8 items-center">
            <Link
              to="/main"
              className="text-gray-300 hover:text-blue-400 flex items-center gap-1"
            >
              <HomeIcon className="w-5 h-5" />
              Home
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowStrategyModal(true)}
              className="text-yellow-300 hover:text-yellow-500 flex items-center gap-2"
            >
              <AcademicCapIcon className="w-5 h-5" />
              <span className="font-semibold">Build Strategy</span>
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto mt-10 p-6 flex flex-col lg:flex-row gap-6 transition-all duration-500">
        {/* GPA Calculator Box */}
        <motion.div
          animate={{ x: gpa ? -50 : 0 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="flex-1 bg-white rounded-3xl shadow-2xl p-10 transition-all duration-500"
        >
          <div className="flex items-center gap-3 mb-8">
            <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Calculate Your GPA
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
            >
            <label className="text-sm text-gray-600 font-medium mb-1 block">
                Select Semester
            </label>
            <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
            >
                {[1, 2, 3, 4].map((sem) => (
                <option key={sem} value={sem}>
                    Semester {sem}
                </option>
                ))}
            </select>
            </motion.div>
          {/* Courses */}
          <div className="grid gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between bg-gray-100 rounded-xl p-4 shadow-md"
              >
                <div className="flex items-center gap-4 w-full">
                  <AcademicCapIcon className="w-7 h-7 text-indigo-500" />
                  <span className="font-medium text-gray-700 w-1/3">
                    {course}
                  </span>

                  <input
                    type="number"
                    min={5}
                    max={10}
                    step={1}
                    value={grades[course] || 5}
                    onChange={(e) => handleGradeChange(course, e.target.value)}
                    className="border border-gray-300 rounded-lg p-1 w-12 text-center focus:ring-2 ring-indigo-300"
                  />
                  <div className="w-1/2 ml-10">
                    <GradientSlider
                      value={grades[course] || 5}
                      onChange={(e) =>
                        handleGradeChange(course, parseFloat(e.target.value))
                      }
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Calculate GPA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={calculateGPA}
            className="mt-14 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 block w-fit"
            >
            Calculate GPA
            </motion.button>
        </motion.div>

        {/* GPA Result Box */}
        {gpa && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-full lg:w-1/4 bg-green-100 border border-green-300 rounded-xl p-6 text-green-800 shadow-xl h-fit self-start text-center"
          >
            <h2 className="text-xl font-bold mb-3 text-green-900">
              🎯 Your GPA
            </h2>
            <p className="text-lg">
              For Semester <span className="font-semibold">{semester}</span>:
            </p>
            <p className="text-4xl font-extrabold mt-3 text-green-900">{gpa}</p>

            {/* Reset Button with animation */}
            <motion.button
              whileHover={{
                scale: 1.05,
                rotate: [0, -2, 2, -2, 0], // shake animation
                transition: { duration: 0.4 },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setGpa(null)}
              className="mt-6 px-5 py-2 rounded-full bg-gradient-to-r from-red-400 to-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            >
              🔄 Reset
            </motion.button>
          </motion.div>
        )}
        {prediction && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-full lg:w-1/2 h-[500px] bg-white border border-blue-200 rounded-2xl p-6 shadow-xl text-blue-900"
          >
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
              📊 Predicted Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prediction.ca2_marks.map((mark, i) => {
                const isLastOdd =
                  prediction.ca2_marks.length % 2 === 1 &&
                  i === prediction.ca2_marks.length - 1;

                return (
                  <div
                    key={i}
                    className={`bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm ${
                      isLastOdd ? "sm:col-span-2 sm:mx-auto sm:w-1/2" : ""
                    }`}
                  >
                    <h3 className="text-md font-semibold mb-2">
                      Subject {i + 1}
                    </h3>
                    <p className="text-sm">
                      <span className="font-medium">CA2 Marks:</span>{" "}
                      <span className="text-blue-700 font-bold">
                        {mark.toFixed(1)}
                      </span>
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Semester Grade:</span>{" "}
                      <span className="text-green-600 font-bold">
                        {prediction.semester_grades[i].toFixed(1)}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Strategy Modal */}
      {showStrategyModal && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white w-full max-w-xl p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowStrategyModal(false)}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
              <AcademicCapIcon className="w-7 h-7" />
              Build Your Grade Strategy
            </h2>

            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-4">
                <label className="block text-gray-600 font-medium mb-1">
                  Subject {i + 1} - CA1 Marks
                </label>
                <GradientSlider
                  value={strategyInputs.ca1_marks[i] || 5}
                  onChange={(e) =>
                    setStrategyInputs((prev) => {
                      const newMarks = [...prev.ca1_marks];
                      newMarks[i] = parseFloat(e.target.value);
                      return { ...prev, ca1_marks: newMarks };
                    })
                  }
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Current CGPA
                </label>
                <input
                  type="number"
                  value={strategyInputs.current_cgpa}
                  onChange={(e) =>
                    setStrategyInputs((prev) => ({
                      ...prev,
                      current_cgpa: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  step="0.1"
                  min={0}
                  max={10}
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Expected CGPA
                </label>
                <input
                  type="number"
                  value={strategyInputs.expected_cgpa}
                  onChange={(e) =>
                    setStrategyInputs((prev) => ({
                      ...prev,
                      expected_cgpa: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  step="0.1"
                  min={0}
                  max={10}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrediction}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg"
            >
              Predict My Grades
            </motion.button>

            {prediction && (
              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                  📈 Prediction Results
                </h3>
                {prediction.ca2_marks.map((mark, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>Subject {i + 1}:</span>
                    <span>
                      CA2: {mark.toFixed(1)} | Semester:{" "}
                      {prediction.semester_grades[i].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const GradientSlider = ({ value, onChange, min = 5, max = 10, step = 1 }) => {
    return (
      <div className="relative w-full">
        <input
          type="range"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className="w-full cursor-pointer h-2 rounded-lg appearance-none bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 focus:outline-none custom-slider"
        />
      </div>
    );
  };
  
  
  
