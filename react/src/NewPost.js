import React,{useState} from "react";
import axios from 'axios';
import NavBar from "./NavBar";
import "./NewPost.css";
export default function NewPost() {  
    const [file, setFile] = useState()
    const [caption, setCaption] = useState("")
  
    const submit = async event => {
      event.preventDefault()
  
      const formData = new FormData();
      formData.append("video", file)
      formData.append("caption", caption)
      await axios.post("/post/video", formData, { headers: {'Content-Type': 'multipart/form-data'}})
    }
    
  const [jsonFile, setJsonFile] = useState(null);
  const handleFileChange = (e) => {
    setJsonFile(e.target.files[0]);
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('jsonFile', jsonFile);
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  };   


    return (
      <>
        <NavBar/>
      <form onSubmit={submit}>
        {/* in case I fill s3 accept now is for image later on production mode should be change back to video */}
        <input onChange={e => setFile(e.target.files[0])} type="file" accept="video/*"></input>
        <input value={caption} onChange={e => setCaption(e.target.value)} type="text" placeholder='Enter Title...'></input>
        <button type="submit">Submit</button>
      </form>
      <form onSubmit={handleFormSubmit}>
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button type="submit">Submit</button>
      </form>
      </>
    )
  }