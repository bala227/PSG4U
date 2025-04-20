import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import loadingAnimation from '../image/loading.json';

function Register() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSignUpClick = () => setIsSignUp(true);
  const handleSignInClick = () => setIsSignUp(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const register = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;
    setLoading(true); // Start loading when registration starts

    try {
      const response = await fetch('https://psg4u.onrender.com/psg4u/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: email,
          password,
          points: 0.0,
        }),
      });

      if (response.ok) {
        alert('Registration successful! You can now sign in.');
        setIsSignUp(false);
      } else {
        alert('User already exists or registration failed.');
      }
    } catch (error) {
      alert('Error occurred during registration');
    } finally {
      setLoading(false); // Stop loading once the process is done
    }
  };

  const login = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    setLoading(true); // Start loading when login starts

    try {
      const response = await fetch('https://psg4u.onrender.com/psg4u/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        navigate('/main');
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      alert('Error occurred during login');
    } finally {
      setLoading(false); // Stop loading once the process is done
    }
  };
 // Define Lottie animation options
 const defaultOptions = {
  loop: true,
  autoplay: true, // Loop the animation
  animationData: loadingAnimation, // Your Lottie animation JSON
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Show loading state */}
        {loading ? (
          <div className="loading-overlay">
          <div className="loading-content">
            <Lottie options={defaultOptions} height={200} width={200} />
            <p>Loading... Please wait.</p>
          </div>
        </div>
        ) : (
          <>
            {/* Image Layer */}
            <div className={`login-image ${isSignUp ? '' : 'slide-right'}`}></div>

            {/* Content */}
            <div className="login-content">
              {/* Sign In */}
              <div className={`form-container form-sign-in ${isSignUp ? 'hidden' : ''}`}>
                <h1 className="welcome-back">PSG4U</h1>
                <p className="instruction">Enter your email and password to access your account</p>
                <form className="login-form" onSubmit={login}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="password-container" style={{ width: 425 }}>
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="login-button">Sign In</button>
                </form>
                <p className="signup-link">
                  Don’t have an account?{' '}
                  <span onClick={handleSignUpClick} className="switch-back">Sign Up</span>
                </p>
              </div>

              {/* Sign Up */}
              <div className={`form-container form-sign-up ${isSignUp ? 'visible' : ''}`}>
                <h1 className="welcome-back">Join PSG4U</h1>
                <p className="instruction">Enter your details to create your account</p>
                <form className="login-form" onSubmit={register}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="password-container" style={{ width: 425 }}>
                    <label>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <button type="submit" className="login-button">Sign Up</button>
                  <div className="login-options">
                    <span onClick={handleSignInClick} className="switch-back">Already have an account? Sign In</span>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
