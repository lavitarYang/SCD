import React,{useState,useEffect} from "react";
import ReactPlayer from "react-player/lazy";
import "./Page.css";
import { useParams } from 'react-router-dom';
import NavBar from "./NavBar";
export default function Page(){
    const {id} = useParams();
    const [cospondVideo,setcospondVideo] = useState([]);
    const [timeRanges1, setTimeRanges1] = useState([]);
    const [timeRanges2, setTimeRanges2] = useState([]);
    useEffect(() => {
      fetch(`/get/video/${id}`)
      .then(response => response.json())
      .then(data => {
        setcospondVideo(data);
        setTimeRanges1(formatTimeRanges(data.KEY1));
        setTimeRanges2(formatTimeRanges(data.KEY2));
      })
      .then(console.log("successful"))
      .catch(error =>console.error(error))
    },[id]);
    const [inputValue, setInputValue] = useState('');
    //for comment
    function handleChange(event) {
      setInputValue(event.target.value);
    }
    function handleSubmit(event) {
      event.preventDefault();
      fetch(`/submit/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputText: inputValue }),
      })
        .then(response => response.json())
        .catch(error => console.error(error));
    }
    //convert timeline
    function formatTimeRanges(timeRanges) {
      const timeFormat = (time) => {
        const hours = Math.floor(time / 60).toString().padStart(2, '0');
        const minutes = (time % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      };
  
      const formattedRanges = timeRanges.map(([start, end]) => {
        const formattedStart = timeFormat(start);
        const formattedEnd = timeFormat(end);
        return `${formattedStart}~${formattedEnd}`;
      });
  
      return formattedRanges;
    }
    return(
      <> 
        <NavBar/>
        {/* <h1 align="center">
          This is view page {id} <br/>
          <a href = {cospondVideo.URL}>
            video
          </a>
        </h1> */}
        <div className='PageContainer'>
          <div className='WatchSection'>
            <div className='Player'>
              <ReactPlayer url={cospondVideo.URL} controls={true} width="3000px" height="390px"  className='ReactPlayer'/>
            </div>
            <div className='RightColumn'>
              <div className='Description'>
                <h1>video name:{cospondVideo.NAME}</h1>
              </div>
              <div className='TimeStemp'>
              {cospondVideo.commentTwo}  
              </div>
            </div>
          </div>
          <div className='PenSection'>
            <div className='Moderator'>
              <form onSubmit={handleSubmit}>
                <input  type="text" value={inputValue} onChange={handleChange} />
                <button type="submit">提交</button>
              </form>
            </div>
            <div className='Administration '>
            <h1>boobs:</h1>
            <ul>
              {timeRanges1.map((range, index) => (
              <li key={index}>{range}</li>))}
            </ul>
            <h1>butt:</h1>
            <ul>
              {timeRanges2.map((range, index) => (
              <li key={index}>{range}</li>))}
            </ul>
            </div>
          </div>
        </div>
      </>
    );
  }