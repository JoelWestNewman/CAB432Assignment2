import React from "react";
import { useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tensorflow from "@tensorflow/tfjs";
import { useEffect } from "react";
import { Image } from "./image";

export function ObjectDetector(props) {
  const [input, setInput] = useState(" ");
  const [displayed, setDisplayed] = useState(" ");
  const [imageComponent, setImageComponent] = useState();
  const [model, setModel] = useState();
  const [searchInput, setSearchInput] = useState("");

  async function loadModel() {
    const model = await cocoSsd.load();
    setModel(model);
    console.log("set loaded Model");
  }

  const createDisplay = async () => {
    setDisplayed(input);
    setImageComponent(<Image props={input}></Image>);

    const imageComp = document.getElementById("imageDisplayed");
    setImageComponent(imageComp);
  };

  const getPredictions = async () => {
    const predictions = await model.detect(imageComponent);
    console.log(predictions);
  };

  useEffect(() => {
    tensorflow.ready().then(() => {
      loadModel();
    });
  }, []);

  return (
    <div>
      <input
        type="text"
        name="name"
        onChange={(event) => setInput(event.target.value)}
      />
      <button onClick={createDisplay}>click me</button>
      {displayed !== " " && (
        <img
          src={displayed}
          id="imageDisplayed"
          name="imageDisplayed"
          crossorigin="anonymous"
        ></img>
      )}
      <button onClick={getPredictions}>get predictions</button>
    </div>
  );
}
