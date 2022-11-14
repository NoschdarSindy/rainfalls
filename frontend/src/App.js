import './App.css';
import HelloWorld from "./components/HelloWorld";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello Gummistiefel</h1>
        Test api response: <HelloWorld />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
