import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./Home.css";
import bgImage from "../images/Home_bg.jpeg";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import logoImage from "../images/logo_psg4u.png";

const features = [
  {
    title: "🔐 Authentication",
    description:
      "Secure login, registration, and session handling.",
  },
  {
    title: "👤 Dashboard",
    description:
      "Check your CGPA, points, and level up through learning engagement.",
  },
  {
    title: "📚 Suggest Resources",
    description:
      "Suggest academic links and earn points using ML-based relevance checking.",
  },
  {
    title: "🔍 Search Resources",
    description: "Search educational materials by subject name.",
  },
  {
    title: "🎓 CGPA Calculator",
    description: "Calculate CGPA instantly and plan for better performance.",
  },
  {
    title: "🧠 Predict Grades (ML)",
    description: "Predict CA2 and semester marks using ML.",
  },
];

const Home = () => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const itemsPerSlide = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prevIndex) =>
        prevIndex + 1 >= Math.ceil(features.length / itemsPerSlide)
          ? 0
          : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Background Image */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-no-repeat bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: "brightness(0.9)",
        }}
      />

      {/* Overlay Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 pt-44 text-center space-y-8">
          <motion.img
            src={logoImage}
            alt="PSG4U Logo"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-60 md:w-80 drop-shadow-lg"
          />

          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 font-medium italic"
            >
              You're not alone in your journey
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 font-medium italic"
            >
              PSG4U is where your academic path finds purpose.
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
            onClick={() => (window.location.href = "/register")}
          >
            Get Started / Login
          </motion.button>
        </section>

        {/* Carousel Section */}
        <section className="mt-36 mb-20 px-6 flex justify-center text-center items-center">
          <motion.div
            key={carouselIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl"
          >
            {features
              .slice(
                carouselIndex * itemsPerSlide,
                carouselIndex * itemsPerSlide + itemsPerSlide
              )
              .map((feature, index) => (
                <div
                  key={index}
                  className="backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform duration-300"
                >
                  <h4 className="text-xl font-bold text-indigo-700 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-700">{feature.description}</p>
                </div>
              ))}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-center py-6 text-gray-200">
          <div className="max-w-7xl mx-auto h-9 flex flex-col md:flex-row justify-center gap-48 items-center">
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold text-white">
                Done with 💙 by{" "}
                <span className="text-blue-400 font-semibold">
                  Bala Subramanian
                </span>
              </p>
              <div className="flex gap-4 mt-2">
                <a
                  href="https://github.com/bala227"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400"
                >
                  <GitHubIcon />
                </a>
                <a
                  href="https://www.linkedin.com/in/bala-subramanian-s-3a95a8261/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-blue-400"
                >
                  <LinkedInIcon />
                </a>
                <a
                  href="mailto:balasubramanian.s2000@gmail.com"
                  className="text-gray-300 hover:text-blue-400"
                >
                  <EmailIcon />
                </a>
              </div>
            </div>
            <div className="text-md text-gray-400 text-center mt-4 md:mt-0">
              <p>
                <span className="text-red-500 text-lg font-bold">PSG4U</span> —
                Empowering students to succeed.
              </p>
              <p>
                &copy; {new Date().getFullYear()} PSG4U. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
