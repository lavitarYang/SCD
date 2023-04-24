import { Link } from "react-router-dom";
import React from "react";
import "./VideoList.css"
import Video from './Video';
export default function VideoList({array}){
    return(
        <>
            {/* to-do
                remove native style of Link 
            */}
            <div className="list">
                {
                    array.map((object,index)=>(
                    <Link key={index}  to={`/videos/${index}`}>
                        <Video  video={object}/>
                    </Link>)
                    )
                }
            </div>
        </>
    );
}