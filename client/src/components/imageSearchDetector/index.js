import React from "react";
import { useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tensorflow from "@tensorflow/tfjs";
import { useEffect } from "react";
import { Image } from "../objectDetector/image";

export function ImageSearchDetector(props) {
  const [searchInput, setSearchInput] = useState("");
  const [images, setImages] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [model, setModel] = useState();
  const [imageComponent, setImageComponent] = useState();
  const [predictions, setPredictions] = useState();

  async function loadModel() {
    const model = await cocoSsd.load();
    setModel(model);
    console.log("set loaded Model");
  }

  const getPredictions = async () => {
    const predictions = await model.detect(imageComponent);
    console.log(predictions);
    setPredictions(predictions);
  };

  const createDisplay = async () => {
    const imageComp = document.getElementById("imageDisplayed");
    setImageComponent(imageComp);
  };

  const createUrl = () => {
    const url =
      "https://live.staticflickr.com/" +
      images[0].server +
      "/" +
      images[0].id +
      "_" +
      images[0].secret +
      "_w.jpg";
    setImageUrl(url);

    //https://live.staticflickr.com/{server-id}/{id}_{secret}_{size-suffix}.jpg
  };

  const getImages = async () => {
    const api_url = "/image?query=" + searchInput;

    fetch(api_url)
      .then((res) => res.json())
      .then((res) => setImages(res));
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
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <button onClick={getImages}>get images</button>
      <br></br>
      {images ? (
        <div>
          id: {images[0].id}
          <br></br>
          owner: {images[0].owner}
          <br></br>
          secret: {images[0].secret}
          <br></br>
          server: {images[0].server}
          <br></br>
          farm: {images[0].farm}
          <br></br>
          title: {images[0].title}
          <br></br>
          <button onClick={createUrl}> create url</button>
          <br></br>
          {imageUrl ? (
            <div>
              <img
                src={imageUrl}
                id="imageDisplayed"
                name="imageDisplayed"
                crossOrigin="anonymous"
              ></img>

              <br></br>
              <button onClick={createDisplay}> create display </button>
              {imageComponent ? (
                <div>
                  <button onClick={getPredictions}> Get Predictions</button>

                  {predictions ? (
                    <div>
                      <h1> Predictions: </h1>

                      {predictions.map((data, key) => (
                        <div className={key}>
                          <h2> class: {data.class} </h2>
                          <h3> score: {data.score}</h3>
                          <h3>
                            {" "}
                            location: {data.bbox[0]}, {data.bbox[1]},{" "}
                            {data.bbox[2]}, {data.bbox[3]}
                          </h3>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
