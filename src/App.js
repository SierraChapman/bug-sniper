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

      break;

    case "awoke":
      const newInactiveBugs = state.inactiveBugs.filter(bugKey => bugKey !== action.key);

      if (newInactiveBugs.length < state.inactiveBugs.length) {
        newState = {
          ...state,
          activeBugs: [...state.activeBugs, action.key],
          inactiveBugs: newInactiveBugs,
        };
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

    default:
  }

  if (newState.inactiveBugs.length > newState.highScore) {
    newState.highScore = newState.inactiveBugs.length;
  }

  return newState;
}

function App() {
  const [windowSize, setWindowSize] = useState(getWindowSize());

  const [state, dispatch] = useReducer(reducer, {
    activeBugs: [Date.now()],
    inactiveBugs: [],
    highScore: 0,
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

  return (
    <div className="App" style={{
      cursor: `url(${process.env.PUBLIC_URL}/scope-small.png) 62 64, auto`
    }}>
      <div className="scores">
        <div>CURRENT SCORE: {state.inactiveBugs.length}</div>
        <div>HIGH SCORE: {state.highScore}</div>
      </div>
      {[
        ...state.inactiveBugs.map(bugKey => <Bug key={bugKey} id={bugKey} windowSize={windowSize} appDispatch={dispatch} />),
        ...state.activeBugs.map(bugKey => <Bug key={bugKey} id={bugKey} windowSize={windowSize} appDispatch={dispatch} />).reverse()
      ]}
    </div>
  );
}

export default App;
