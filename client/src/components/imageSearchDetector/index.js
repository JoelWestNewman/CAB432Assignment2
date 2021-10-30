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
  const [mobilePredictions, setMobilePredictions] = useState([]);
  const [clientSidePredictions, setClientSidePredictions] = useState(true);
  const [noImagesFound, setNoImagesFound] = useState(false);
  const [imageInput, setImageInput] = useState();

  const imageRef = useRef();

  const containerStyle = {
    background: "white",
    border: "1px solid darkgrey",
    padding: "15px",
    color: "black",
    width: "60%",
    margin: "auto",
    borderRadius: "10px",
  };

  const urlStyle = {
    background: "white",
    border: "1px solid darkgrey",
    padding: "15px",
    color: "black",
    borderRadius: "10px",
  };

  async function loadModel() {
    setModelLoading(true);
    const model = await cocoSsd.load();
    setModel(model);
    console.log("set loaded Model");
    setModelLoading(false);
  }

  const getPredictions = async () => {
    const imageComp = document.getElementById("imageDisplayed");

    const api_url = "/predict?query=" + imageInput;
    fetch(api_url)
      .then((res) => res.json())
      .then((res) => {
        const appended = res;
        delete appended["source"];
        console.log(Object.values(appended));
        setMobilePredictions(Object.values(appended));
      });

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
    setImageInput(searchInput);

    fetch(api_url)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.photos.pages === 0) {
          setNoImagesFound(true);
        } else {
          setImages(res.photos.photo);
          setNoImagesFound(false);
        }
      });
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
          {clientSidePredictions ? (
            <div>
              {" "}
              <Button
                variant="contained"
                onClick={(event) => setClientSidePredictions(false)}
              >
                Use Server-Side Predictions
              </Button>
            </div>
          ) : (
            <div>
              <Button
                variant="contained"
                onClick={(event) => setClientSidePredictions(true)}
              >
                Use Client-Side Predictions
              </Button>{" "}
            </div>
          )}
          <br />
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
          <br />
          {noImagesFound ? (
            <h2>No images found for that query. Please enter another one</h2>
          ) : null}
          {images || imageUrl ? (
            <div>
              <br />
              {images ? (
                <div style={urlStyle}>
                  <h1> Image Data Found: </h1>
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
                    Generate Image
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
                        {clientSidePredictions ? (
                          <div>
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
                        ) : (
                          <div>
                            {mobilePredictions ? (
                              <div>
                                {mobilePredictions.map((data, key) => (
                                  <div className={key}>
                                    <h2> class: {data.className} </h2>
                                    <h3> score: {data.probability}</h3>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                <h3>loading more predictions from server...</h3>
                              </div>
                            )}
                          </div>
                        )}
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
