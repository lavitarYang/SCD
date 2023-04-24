import React,{useState,useEffect} from "react";
import { Route, Routes} from 'react-router-dom';
import NewPost from "./NewPost";
import VideoList from "./VideoList";
import Page from './Page';
import Home from './Home';
export default function App(){ 
    return(
        <>
            <Routes>
                <Route path='/' element={<Home />}/>
                <Route path='/videos' element={<VideoList ar/>}/>
                <Route path='/videos/:id' element={<Page />}/>
                <Route path='/upload' element={<NewPost />}/>
           </Routes>
        </>
    );
}