import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import bg from "../images/mainbg.jpg";
import GPAChart from "../components/GPAChart.jsx";

const coursesPerSemester = {
  1: [
    { name: "Calculus", credit: 4 },
    { name: "Electronics", credit: 3 },
    { name: "Chemistry", credit: 3 },
    { name: "CT", credit: 3 },
    { name: "English", credit: 3 },
    { name: "Python Lab", credit: 2 },
    { name: "Engineering Practices", credit: 1 },
    { name: "Basic Science Lab", credit: 2 },
  ],
  2: [
    { name: "Transforms", credit: 4 },
    { name: "COA", credit: 4 },
    { name: "Material Science", credit: 3 },
    { name: "Discrete Mathematics", credit: 3 },
    { name: "Chemistry", credit: 2 },
    { name: "C Lab", credit: 2 },
    { name: "EG", credit: 2 },
    { name: "English", credit: 2 },
  ],
  3: [
    { name: "Linear Algebra", credit: 4 },
    { name: "Probability", credit: 4 },
    { name: "Data Structures", credit: 4 },
    { name: "Software Engineering", credit: 3 },
    { name: "PPL", credit: 4 },
    { name: "Economics", credit: 3 },
    { name: "DS Lab", credit: 2 },
    { name: "Java Lab", credit: 2 },
    { name: "English", credit: 2 },
    { name: "Tamil", credit: 1 },
  ],
  4: [
    { name: "Optimization Techniques", credit: 3 },
    { name: "DAA", credit: 3 },
    { name: "Operating Systems", credit: 4 },
    { name: "Machine Learning - I", credit: 3 },
    { name: "Database Systems", credit: 3 },
    { name: "ML Lab", credit: 2 },
    { name: "DBS Lab", credit: 2 },
    { name: "English", credit: 1 },
    { name: "Tamil", credit: 1 },
  ],
  5: [
    { name: "Artificial Intelligence", credit: 4 },
    { name: "Deep Learning", credit: 3 },
    { name: "Computer Networks", credit: 4 },
    { name: "Machine Learning - II", credit: 4 },
    { name: "Design Thinking", credit: 3 },
    { name: "Deep Learning Lab", credit: 2 },
    { name: "App Dev Lab", credit: 2 },
    { name: "English", credit: 1 },
  ],
  6: [
    { name: "Parallel and Distributed Computing", credit: 4 },
    { name: "Natural Language Processing", credit: 3 },
    { name: "Data Privacy and Security", credit: 3 },
    { name: "Big Data", credit: 3 },
    { name: "Cloud Computing", credit: 3 },
    { name: "Innovation Practices", credit: 2 },
    { name: "Big Data Laboratory", credit: 2 },
    { name: "English", credit: 1 },
  ],
};

export const CalculateGPA = () => {
  const [semester, setSemester] = useState(1);
  const [cgpa, setcgpa] = useState(0);
  const [rollno, setrollno] = useState("");
  const [currentSemester, setCurrentSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState({});
  const [gpa, setGpa] = useState(null);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [gpaData, setGpaData] = useState(null);
  const [strategyInputs, setStrategyInputs] = useState({
    selected_semester: 1,
    ca1_marks: coursesPerSemester[1].map(() => 25),
    current_cgpa: cgpa,
    expected_cgpa: 9.0,
  });

  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    // Fetch GPA data for the given rollno
    fetch("http://127.0.0.1:8000/psg4u/get-user-gpa/", {
      method: "GET",
      credentials: "include", // <--- this is important for Django sessions!
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setGpaData(data);
      })
      .catch((error) => {
        console.error("Error fetching GPA data:", error);
      });
  }, [rollno]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/psg4u/calculate-cgpa/", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.cgpa) {
          setcgpa(data.cgpa); // Update the CGPA state
          setStrategyInputs((prev) => ({
            ...prev,
            current_cgpa: cgpa, // Default to current semester
          }));
        } else {
          console.error("Error fetching CGPA");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch CGPA: " + err.message);
      });
    // Fetch the user details to get the current semester
    fetch("http://127.0.0.1:8000/psg4u/me/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setrollno(data.rollno);
        setCurrentSemester(data.semester);
        setSemester(data.semester);
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      });
  }, []);

  useEffect(() => {
    const selectedCourses = coursesPerSemester[semester] || [];
    setCourses(selectedCourses);

    const initialGrades = {};
    selectedCourses.forEach((course) => {
      initialGrades[course.name] = 5;
    });
    setGrades(initialGrades);

    // Reset GPA when semester changes
    setGpa(null);
  }, [semester]);

  const handleGradeChange = (course, value) => {
    const newGrades = { ...grades, [course]: parseFloat(value) };
    setGrades(newGrades);
  };

  const calculateGPA = () => {
    const selectedCourses = coursesPerSemester[semester] || [];
    let totalCredits = 0;
    let weightedSum = 0;

    selectedCourses.forEach((course) => {
      const grade = grades[course.name] || 0;
      weightedSum += grade * course.credit;
      totalCredits += course.credit;
    });

    const gpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
    setGpa(gpa);
    setPrediction(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const storeGPA = () => {
    const selectedCourses = coursesPerSemester[semester] || [];
    let totalCredits = 0;
    let weightedSum = 0;

    selectedCourses.forEach((course) => {
      const grade = grades[course.name] || 0;
      weightedSum += grade * course.credit;
      totalCredits += course.credit;
    });

    const gpaValue =
      totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 0;
    setGpa(gpaValue);
    setPrediction(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (gpaValue && semester) {
      // Store GPA
      fetch("http://127.0.0.1:8000/psg4u/store-gpa/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          // Include CSRF token or auth headers if needed
        },
        body: JSON.stringify({
          gpa: gpaValue,
          semester_number: semester,
        }),
      })
        .then((res) =>
          res.json().then((data) => ({ status: res.status, data }))
        )
        .then(({ status, data }) => {
          if (status === 200) {
            alert("GPA saved: " + data.message);
          } else {
            alert("GPA error: " + data.error);
          }
        })
        .catch((err) => {
          alert("GPA request failed: " + err.message);
        });

      // Store total credits and points
      fetch("http://127.0.0.1:8000/psg4u/store-credits/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester: semester,
          total_points: weightedSum,
          total_credits: totalCredits,
        }),
      })
        .then((res) =>
          res.json().then((data) => ({ status: res.status, data }))
        )
        .then(({ status, data }) => {
          if (status === 200) {
            console.log("Credits info stored successfully!");

            // Refresh the page after storing credits successfully
            window.location.reload();
          } else {
            console.error("Credits error:", data.error);
          }
        })
        .catch((err) => {
          console.error("Credits request failed:", err.message);
        });
    }
  };

  const handlePrediction = async () => {
    setGpa(null); // Hides the GPA result box
    const res = await fetch("http://127.0.0.1:8000/psg4u/predict/", {
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
              onChange={(e) => setSemester(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
            >
              {Array.from({ length: currentSemester }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
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
                    {course.name} ({course.credit} credits)
                  </span>

                  <input
                    type="number"
                    min={5}
                    max={10}
                    step={1}
                    value={grades[course.name] || 5}
                    onChange={(e) =>
                      handleGradeChange(course.name, e.target.value)
                    }
                    className="border border-gray-300 rounded-lg p-1 w-12 text-center focus:ring-2 ring-indigo-300"
                  />
                  <div className="w-1/2 ml-10">
                    <GradientSlider
                      value={grades[course.name] || 5}
                      onChange={(e) =>
                        handleGradeChange(
                          course.name,
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Calculate GPA Button */}
          <div className="flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={calculateGPA}
              className="mt-14 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 block w-fit"
            >
              Calculate GPA
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={storeGPA}
              className="mt-14 mx-auto bg-green-600 border border-green-300 text-white py-3 px-6 rounded-lg font-semibold transition duration-300 block w-fit"
            >
              Calculate and Store GPA
            </motion.button>
          </div>
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
        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="flex-[1.5] min-w-[300px] max-w-[600px] max-h-[600px] bg-white border border-blue-200 rounded-2xl p-6 shadow-xl text-blue-900 overflow-y-auto scrollbar-hide relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setPrediction(false)}
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
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
                        {coursesPerSemester[strategyInputs.selected_semester][i]
                          ?.name || `Subject ${i + 1}`}
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
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <section className="relative z-10 mt-20 pb-14 px-6 md:px-10 text-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-10">
            {/* Left: GPA Cards Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex-1 bg-gradient-to-br from-[#fefefe] to-[#d8e9ff] text-gray-900 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full"
            >
              <motion.h2
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-2xl font-extrabold text-center mb-10 text-gray-600"
              >
                🎓 Your Semester-wise GPA
              </motion.h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {gpaData ? (
                  Array.from({ length: 8 }).map((_, i) => {
                    const key = `gpa_sem${i + 1}`;
                    const gpa = i + 1 <= currentSemester ? gpaData[key] : null;

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        className={`rounded-lg p-6 text-center shadow-md ${
                          gpa !== null ? "bg-white" : "bg-gray-200"
                        }`}
                      >
                        <h4 className="text-lg font-semibold text-gray-700 mb-1">
                          Semester {i + 1}
                        </h4>
                        <p
                          className={`text-xl font-bold ${
                            gpa !== null
                              ? "text-blue-600"
                              : "text-gray-400 text-sm"
                          }`}
                        >
                          {gpa !== null ? gpa.toFixed(2) : "-"}
                        </p>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-4 text-center text-gray-600 py-6">
                    Fetching GPA data...
                  </div>
                )}
              </div>
            </motion.div>

            {gpaData && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="w-full lg:w-1/4 bg-green-100 border border-green-300 rounded-xl p-6 text-green-800 shadow-xl h-fit self-start text-center"
              >
                <h2 className="text-xl font-bold mb-3 text-green-900">
                  📊 Cumulative GPA
                </h2>
                <p className="text-md">
                  Upto{" "}
                  <span className="font-semibold">
                    {currentSemester} Semesters
                  </span>
                </p>
                <p className="text-4xl font-extrabold mt-3 text-green-900">
                  {cgpa}
                </p>
              </motion.div>
            )}
          </div>
        </section>
      </AnimatePresence>
      <GPAChart gpaData={gpaData} currentSemester={currentSemester} />

      {showStrategyModal && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 px-4 "
        >
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] scrollbar-hide overflow-y-auto p-6 rounded-3xl shadow-2xl relative"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowStrategyModal(false)}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
              <AcademicCapIcon className="w-7 h-7" />
              Build Your Grade Strategy
            </h2>

            {/* Semester Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Semester
              </label>
              <select
                value={strategyInputs.selected_semester || 1}
                onChange={(e) =>
                  setStrategyInputs((prev) => ({
                    ...prev,
                    selected_semester: parseInt(e.target.value),
                    ca1_marks: coursesPerSemester[parseInt(e.target.value)].map(
                      () => 25
                    ),
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {Object.keys(coursesPerSemester).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-8">
              {coursesPerSemester[strategyInputs.selected_semester || 1]?.map(
                (subject, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    {/* Subject Name */}
                    <div className="text-gray-800 font-medium w-1/2">
                      {subject.name}
                    </div>

                    {/* Slider + Value Display */}
                    <div className="relative w-1/2">
                      {/* Live Value on Top */}
                      <div className="absolute top-1 -left-10 transform -translate-x-1/2 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full shadow-sm font-semibold">
                        {strategyInputs.ca1_marks[i] || 0}
                      </div>

                      {/* Slider */}
                      <input
                        type="range"
                        value={strategyInputs.ca1_marks[i] || 0}
                        onInput={(e) => {
                          const updatedMarks = [...strategyInputs.ca1_marks];
                          updatedMarks[i] = parseFloat(e.target.value);
                          setStrategyInputs((prev) => ({
                            ...prev,
                            ca1_marks: updatedMarks,
                          }));
                        }}
                        min={0}
                        max={50}
                        step={1}
                        className="w-full appearance-none bg-gray-200 rounded-lg h-2 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-indigo-600
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-indigo-600"
                      />

                      {/* Tick Marks */}
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                        {[0, 10, 20, 30, 40, 50].map((mark) => (
                          <span key={mark}>{mark}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* CGPA Inputs */}
            <div className="grid grid-cols-2 gap-4 mt-10">
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  step="0.1"
                  min={0}
                  max={10}
                />
              </div>
            </div>

            {/* Predict Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePrediction}
              className="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg"
            >
              Predict My Grades
            </motion.button>
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
