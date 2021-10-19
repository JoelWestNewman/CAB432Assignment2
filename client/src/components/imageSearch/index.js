import React from "react";
import { useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tensorflow from "@tensorflow/tfjs";
import { useEffect } from "react";
import { Image } from "../objectDetector/image";

export function ImageSearch(props) {
  const [searchInput, setSearchInput] = useState("");
  const [images, setImages] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

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

    // fetch(api_url).then((res) => console.log(res.json()));
    // let response = await fetch(api_url);
    // let body = await response.json();
    // console.log(response);
    // console.log(body);

    //.then((res) => res.json())
    //.then((res) => setImages(res))
    //.then(() => console.log(images));
  };

  useEffect(() => {}, []);

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
          {imageUrl ? <img src={imageUrl}></img> : null}
        </div>
      ) : null}
    </div>
  );
}
