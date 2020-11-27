import { useState, useEffect, useReducer } from 'react';
import Bug from './components/Bug';
import './App.css';

function getWindowSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

function reducer(state, action) {
  let newState = state;

  switch (action.type) {
    case "squashed":
      const newActiveBugs = state.activeBugs.filter(bugKey => bugKey !== action.key);

      if (newActiveBugs.length < state.activeBugs.length) {
        newState = {
          ...state,
          activeBugs: [...newActiveBugs, Date.now()],
          inactiveBugs: [...state.inactiveBugs, action.key],
        };
      }

      if (newState.inactiveBugs.length > newState.highScore) {
        newState.highScore = newState.inactiveBugs.length;
        localStorage.setItem("highScore", JSON.stringify(newState.highScore));
      }

      break;

    case "escaped":
      newState = { ...state, activeBugs: state.activeBugs.filter(bugKey => bugKey !== action.key) };
      break;

    case "new": 
      newState = {
        ...state,
        activeBugs: [...state.activeBugs, Date.now()],
      };
      break;

    case "fire": 
      if (state.shotsLeft > 0) {
        newState = {
          ...state,
          shotsLeft: state.shotsLeft - 1,
        };
      }
      break;

    default:
  }

  return newState;
}

function App() {
  const [windowSize, setWindowSize] = useState(getWindowSize());

  const [state, dispatch] = useReducer(reducer, {
    activeBugs: [Date.now()],
    inactiveBugs: [],
    highScore: parseInt(localStorage.getItem("highScore")) || 0,
    shotsLeft: 6,
  });

  useEffect(() => {
    const handleResize = () => setWindowSize(getWindowSize());
    window.addEventListener("resize", handleResize);

    const bugGenerationInterval = setInterval(() => dispatch({ type: "new" }), 25000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(bugGenerationInterval);
    };
  }, []);

  function renderBullets(numBullets) {
    const bullets = [];

    for (let i = 0; i < numBullets; i++) {
      bullets.push(<div className="bullet" key={i}></div>);
    }

    return bullets;
  }

  return (
    <div className="App" onClick={() => dispatch({type: "fire"})} style={{
      cursor: `url(${process.env.PUBLIC_URL}/scope-small.png) 62 64, auto`
    }}>
      <div className="scores">
        <div>CURRENT SCORE: {state.inactiveBugs.length}</div>
        <div>HIGH SCORE: {state.highScore}</div>
        <div>{renderBullets(state.shotsLeft)}</div>
      </div>
      {[
        ...state.inactiveBugs.map(bugKey => <Bug key={bugKey} id={bugKey} windowSize={windowSize} appDispatch={dispatch} />),
        ...state.activeBugs.map(bugKey => <Bug key={bugKey} id={bugKey} windowSize={windowSize} appDispatch={dispatch} clickable={state.shotsLeft > 0}/>).reverse()
      ]}
    </div>
  );
}

export default App;
