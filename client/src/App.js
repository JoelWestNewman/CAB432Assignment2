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
      <h1> machine learning application</h1>
      <ImageSearchDetector />
    </div>
  );
}

export default App;
