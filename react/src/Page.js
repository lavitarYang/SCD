import React,{useState,useEffect} from "react";
import ReactPlayer from "react-player/lazy";
import "./Page.css";
import { useParams } from 'react-router-dom';
import NavBar from "./NavBar";
export default function Page(){
    const {id} = useParams();
    const [cospondVideo,setcospondVideo] = useState([])
    useEffect(() => {
      fetch(`/get/video/${id}`)
      .then(response => response.json())
      .then(data => setcospondVideo(data))
      .then(console.log("successful"))
    },[id]);
    return(
      <> 
        <NavBar/>
        <h1>
          this is view page {id} <br/>
          <a href = {cospondVideo.URL}>
            video
          </a>
        </h1>
        <div className='PageContainer'>
          <div className='WatchSection'>
            <div className='Player'>
              <ReactPlayer url={cospondVideo.URL} controls={true} className='ReactPlayer'/>
            </div>
            <div className='RightColumn'>
              <div className='Description'>
              </div>
              <div className='TimeStemp'>
              </div>
            </div>
          </div>
          <div className='PenSection'>
            <div className='Moderator'>
            </div>
            <div className='Administration '></div>
          </div>
  
        </div>
      </>
    );
  }