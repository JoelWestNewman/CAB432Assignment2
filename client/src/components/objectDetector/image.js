import React from "react";
import { ReactDOM } from "react";

export function Image(props) {
  const image = <img src={props}></img>;
  return ReactDOM.render(image, document.getElementById("root"));
}
