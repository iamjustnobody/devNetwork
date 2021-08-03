import logo from './logo.svg';
import './App.css';
import { Fragment } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Landing } from './components/layout/Landing';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
}*/

const App=()=>
  <Router>
    <Fragment>
      <Navbar />
      <Route exact path='/' component={Landing} />
    </Fragment>
  </Router>
  

export default App;
//<Fragment><Navbar /><Landing /></Fragment>   <div><Navbar /><Landing /></div> 
//<Router><Fragment><Navbar /><Landing /></Fragment></Router> == <Router><Fragment><Navbar /><Route exact path='/' component={Landing} /></Fragment></Router>