import React from "react";
import Thumbuail from "./Thumbnail";
import './Video.css';
export default function Video({video}){
    return(
        <div className="container">
            <Thumbuail className="Thum"/>
            <div className="detail">
                <h3>title{video.ID}</h3>
                <p>const description</p>
            </div>
        </div>
    );
}