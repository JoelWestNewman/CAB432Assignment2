import React from "react";
import { useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tensorflow from "@tensorflow/tfjs";
import { useEffect } from "react";
import { Image } from "../objectDetector/image";
import { useRef } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

export function ImageSearchDetector(props) {
  const [searchInput, setSearchInput] = useState("");
  const [images, setImages] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [model, setModel] = useState();
  const [imageComponent, setImageComponent] = useState();
  const [predictions, setPredictions] = useState();
  const [modelLoading, setModelLoading] = useState(false);

  const imageRef = useRef();

  const containerStyle = {
    background: "white",
    border: "1px solid darkgrey",
    padding: "15px",
    color: "black",
    width: "60%",
    margin: "auto",
  };

  const urlStyle = {
    background: "white",
    border: "1px solid darkgrey",
    padding: "15px",
    color: "black",
  };

  async function loadModel() {
    setModelLoading(true);
    const model = await cocoSsd.load();

    //const api_url = "/api/startModel";

    //fetch(api_url).then((res) => setModel(res));

    setModel(model);
    console.log("set loaded Model");
    setModelLoading(false);
  }

  const getPredictions = async () => {
    const imageComp = document.getElementById("imageDisplayed");

    // const api_url = "/getPrediction";
    // fetch(api_url, {
    //   method: "POST",
    //   body: imageComp,
    // }).then((res) => console.log(res));

    const predictions = await model.detect(imageComp);
    setPredictions(predictions);
  };

  const TargetBox = (props) => {
    //get position of image
    const position = document
      .getElementById("imageDisplayed")
      .getBoundingClientRect();

    const translateLeft =
      props.props.bbox[0] + window.innerWidth / 2 - imageRef.current.width / 2;
    const translateDown = props.props.bbox[1] + position.y;
    //style the box using the coordinates
    const styles = {
      rectangle: {
        position: "absolute",
        left: translateLeft + "px",
        top: translateDown + "px",
        width: props.props.bbox[2] + "px",
        height: props.props.bbox[3] + "px",
        border: "4px solid green",
        color: "white",
      },
    };
    return (
      <div>
        <div className="rectangle" style={styles.rectangle}>
          {" "}
          {props.props.class} {props.props.score}
        </div>
      </div>
    );
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
    setPredictions("");

    //https://live.staticflickr.com/{server-id}/{id}_{secret}_{size-suffix}.jpg
  };

  const getImages = async () => {
    const api_url = "/api/search?query=" + searchInput;

    fetch(api_url)
      .then((res) => res.json())
      .then((res) => setImages(res.photos.photo));
  };

  useEffect(() => {
    tensorflow.ready().then(() => {
      loadModel();
    });
  }, []);

  return (
    <div style={containerStyle}>
      {modelLoading ? (
        <h3>Loading the machine learning model...</h3>
      ) : (
        <div>
          <TextField
            id="outlined-basic"
            label="Search For An Image"
            variant="outlined"
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <br />

          <Button variant="contained" onClick={getImages}>
            Get Images
          </Button>
          <p> or provide direct link: </p>
          <TextField
            id="outlined-basic"
            label="Provide Direct Link To Image"
            variant="outlined"
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <br />
          {images || imageUrl ? (
            <div>
              <br />
              {images ? (
                <div style={urlStyle}>
                  id: {images[0].id}
                  <br />
                  owner: {images[0].owner}
                  <br />
                  secret: {images[0].secret}
                  <br />
                  server: {images[0].server}
                  <br />
                  farm: {images[0].farm}
                  <br />
                  title: {images[0].title}
                  <br />
                  <Button variant="contained" onClick={createUrl}>
                    {" "}
                    Create Url
                  </Button>
                  <h1> </h1>{" "}
                </div>
              ) : null}

              <br />
              {imageUrl ? (
                <div>
                  <img
                    src={imageUrl}
                    id="imageDisplayed"
                    name="imageDisplayed"
                    crossOrigin="anonymous"
                    ref={imageRef}
                  ></img>

                  <br />

                  <div>
                    <Button variant="contained" onClick={getPredictions}>
                      {" "}
                      Get Predictions
                    </Button>

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
                            <TargetBox props={data} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
