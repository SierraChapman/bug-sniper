import { useState, useEffect, useReducer } from 'react';
import Bug from './components/Bug';
import ReloadMessage from './components/ReloadMessage';
import './App.css';

const MAX_BULLETS = 6;

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
          score: state.score + 1
        };
      }

      if (newState.score > newState.highScore) {
        newState.highScore = newState.score;
        localStorage.setItem("highScore", JSON.stringify(newState.highScore));
      }

      break;

    case "remove":
      newState = { ...state, inactiveBugs: state.inactiveBugs.filter(bugKey => bugKey !== action.key) };
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
      } else {
        newState = {
          ...state,
          showReloadMessage: true,
        }
      }
      break;

    case "reload":
      if (state.shotsLeft < MAX_BULLETS)
      newState = {
        ...state,
        shotsLeft: state.shotsLeft + 1,
        showReloadMessage: false,
      };
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
    score: 0,
    highScore: parseInt(localStorage.getItem("highScore")) || 0,
    shotsLeft: MAX_BULLETS,
    showReloadMessage: false,
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

  function handleKeyPress(event) {
    if (event.key === " ") {
      dispatch({ type: "reload" });
    }
  }

  return (
    <div className="App" onClick={() => dispatch({ type: "fire" })} onKeyUp={handleKeyPress} tabIndex={0} style={{
      cursor: `url(${process.env.PUBLIC_URL}/scope.png) 62 67, auto`,
      outline: "none",
    }}>
      <div className="scores">
        <div>CURRENT SCORE: {state.score}</div>
        <div>HIGH SCORE: {state.highScore}</div>
        <div>{renderBullets(state.shotsLeft)}</div>
      </div>
      <ReloadMessage display={state.showReloadMessage}/>
      {[
        ...state.inactiveBugs.map(bugKey => <Bug key={bugKey} id={bugKey} windowSize={windowSize} appDispatch={dispatch} />),
        ...state.activeBugs.map(bugKey => <Bug key={bugKey} id={bugKey} windowSize={windowSize} appDispatch={dispatch} clickable={state.shotsLeft > 0}/>).reverse()
      ]}
    </div>
  );
}

export default App;
