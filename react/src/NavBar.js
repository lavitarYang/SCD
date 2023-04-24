import {Link} from 'react-router-dom';
import React from "react";
import "./NavBar.css";
export default function NavBar(){
    return(
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/upload">Upload</Link></li>
          </ul>
        </nav>
    );
}