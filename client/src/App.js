import logo from "./logo.svg";
import "./App.css";
import { ObjectDetector } from "./components/objectDetector";
import { ImageSearch } from "./components/imageSearch";
import { ImageSearchDetector } from "./components/imageSearchDetector";

import React from "react";
import { useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tensorflow from "@tensorflow/tfjs";
import { useEffect } from "react";
import { useRef } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

//<ObjectDetector />
//<ImageSearch />

function App() {
  return (
    <div className="App">
      <h1>
        <img
          src="http://simpleicon.com/wp-content/uploads/camera.png"
          height="25px"
        />
        {"  "}Image Detector
      </h1>

      <ImageSearchDetector />
    </div>
  );
}

export default App;
