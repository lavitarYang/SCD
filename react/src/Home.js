import { useLocation} from 'react-router-dom';
import React,{useState,useEffect} from "react";
import VideoList from "./VideoList";
import "./Home.css";
import NavBar from './NavBar';
export default function Home(){
    const location = useLocation();
    const [backEndData,setBackEndData] = useState([{}])
    useEffect(() => {
        fetch("/api")
          .then(response => response.json())
          .then(data => setBackEndData(data))
          .then(console.log("successful"))
    },[]);
    return(
      <>
        <NavBar/>
        {location.pathname === "/" &&
          <div className='topimage'>
            <h1 className='glow'>Sensitive Content Detection</h1>
          </div>
        }
        {location.pathname === "/" && 
          <VideoList array={backEndData}/>
        }
      </>
    );
  }
  