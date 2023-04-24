import React,{useState,useEffect} from "react";
import ReactPlayer from "react-player/lazy";
import "./Page.css";
import { useParams } from 'react-router-dom';
import NavBar from "./NavBar";
export default function Page(){
    const {id} = useParams();
    const [cospondVideo,setcospondVideo] = useState([])
    const [outputText, setOutputText] = useState('');
    useEffect(() => {
      fetch(`/get/video/${id}`)
      .then(response => response.json())
      .then(data => setcospondVideo(data))
      .then(console.log("successful"))
    },[id]);
    const [inputValue, setInputValue] = useState('');

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
    return(
      <> 
        <NavBar/>
        <h1 align="center">
          This is view page {id} <br/>
          <a href = {cospondVideo.URL}>
            video
          </a>
        </h1>
        <div className='PageContainer'>
          <div className='WatchSection'>
            <div className='Player'>
              <ReactPlayer url={cospondVideo.URL} controls={true} width="3000px" height="390px"  className='ReactPlayer'/>
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
              <form onSubmit={handleSubmit}>
                <input  type="text" value={inputValue} onChange={handleChange} />
                <button type="submit">提交</button>
              </form>
            </div>
            <div className='Administration '>
               {cospondVideo.commentTwo}
            </div>
          </div>
  
        </div>
      </>
    );
  }