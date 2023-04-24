import React from "react";
import './Thumbnail.css';
import image from "./static.jpg"
export default function Thumbail (){
    return(
        <div className="VideoButton">
            {/* use static thumbnail */}
            <img className="Child" src={image}/>  
        </div>
    );
}