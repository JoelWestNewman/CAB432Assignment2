import logo from "./logo.svg";
import "./App.css";
import { ObjectDetector } from "./components/objectDetector";
import { ImageSearch } from "./components/imageSearch";
import { ImageSearchDetector } from "./components/imageSearchDetector";

//<ObjectDetector />
//<ImageSearch />

function App() {
  return (
    <div className="App">
      <h1>Image Detector</h1>
      <img src="JustLogo.png" />
      <ImageSearchDetector />
    </div>
  );
}

export default App;
