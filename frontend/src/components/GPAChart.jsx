import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import loadingAnimation from '../images/loading.json';
import Lottie from 'react-lottie';
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);
const defaultOptions = {
  loop: true,
  autoplay: true, // Loop the animation
  animationData: loadingAnimation, // Your Lottie animation JSON
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};const GPAChart = ({ gpaData, currentSemester }) => {
  if (!gpaData) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <Lottie options={defaultOptions} height={200} width={200} />
          <p>📊 Loading GPA data...</p>
          <p>Please Wait 😁✌️</p>
        </div>
      </div>
    );
  }

  const gpas = [];
  const cgpAs = [];
  let totalPoints = 0;
  let totalCredits = 0;

  for (let i = 1; i <= 8; i++) {
    const key = `gpa_sem${i}`;
    const gpa = gpaData[key];

    if (i <= currentSemester && gpa !== null && !isNaN(gpa)) {
      const parsedGPA = parseFloat(gpa);
      gpas.push(parsedGPA.toFixed(2));
      totalPoints += parsedGPA;
      totalCredits += 1;
      cgpAs.push((totalPoints / totalCredits).toFixed(2));
    } else {
      gpas.push(null);
      cgpAs.push(null);
    }
  }

  // Check if any valid GPA exists
  const hasValidData = gpas.some(val => val !== null);

  if (!hasValidData) {
    return (
      <div className="w-full flex justify-center mt-10 pb-20">
        <div className="w-full max-w-4xl bg-gradient-to-br from-white to-yellow-50 rounded-2xl p-8 shadow-2xl">
          <h3 className="text-2xl font-extrabold mb-6 text-center text-yellow-700 tracking-wide">
            No GPA data available 
          </h3>
          <p className="text-center text-lg text-gray-700">
            Please fill your semester GPA details to see the graph.
          </p>
        </div>
      </div>
    );
  }

  // Combine gpas and cgpAs into a single flat array of valid numbers
  const allValid = [...gpas, ...cgpAs].filter(val => val !== null).map(parseFloat);

  const minGPA = Math.min(...allValid);
  const maxGPA = Math.max(...allValid);

  const chartData = {
    labels: Array.from({ length: 8 }, (_, i) => `Sem ${i + 1}`),
    datasets: [
      {
        label: "Semester GPA",
        data: gpas,
        fill: true,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#fff",
        pointHoverRadius: 8,
        pointRadius: 6,
        tension: 0.4,
      },
      {
        label: "Cumulative GPA",
        data: cgpAs,
        fill: true,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#fff",
        pointHoverRadius: 8,
        pointRadius: 6,
        borderDash: [6, 5],
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#374151",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#e5e7eb",
        borderColor: "#4b5563",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
  y: {
    min: Math.max(5, Math.floor(minGPA * 10) / 10 - 0.2),
    max: Math.min(10, Math.ceil(maxGPA * 10) / 10 + 0.2),
    ticks: {
      stepSize: 0.2,
      color: "#6B7280",
      font: {
        size: 13,
        weight: "600",
      },
    },
    title: {
      display: true,
      text: "GPA Scale",
      color: "#4B5563",
      font: {
        size: 14,
        weight: "bold",
      },
    },
    grid: {
      color: "rgba(0,0,0,0.05)",
    },
  },
}

  };

  return (
    <div className="w-full flex justify-center mt-10 pb-20">
      <div className="w-full max-w-4xl bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-2xl font-extrabold mb-6 text-center text-blue-700 tracking-wide">
          📊 Semester-wise & Cumulative GPA
        </h3>
        <div className="relative h-[400px]">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default GPAChart;
