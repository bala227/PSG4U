import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import './Home.css'

const Home = () => {


  return (
    <div className='wholepage'>
      <section className="homebody">
        <div id="home" className="home">
          <h1>THE STUDENT'S SPACE</h1>
          <i>Where all the needs are met</i>
        </div>
      
        <button className="loginbutton">
          <RouterLink to={'/register'}><span>Login</span></RouterLink>
        </button>
      </section>

    </div>
  )
}

export default Home;
