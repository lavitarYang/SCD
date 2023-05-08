import React from "react";
import Thumbuail from "./Thumbnail";
import './Video.css';

export default function Video({video}) {
  return (
    <div className="container">
      <div className="left">
        <Thumbuail className="Thum"/>
      </div>
      <div className="right">
        <div className="detail">
          <h3 align="center">Title:{video.ID}</h3>
          <p align="center">const description</p>
        </div>
      </div>
    </div>
  );
}
