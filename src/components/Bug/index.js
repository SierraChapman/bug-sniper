import { useEffect, useReducer, useCallback } from 'react';
import './style.css';

const TIMESTEP = 20; // ms
const SIZE = 25; // px
const AWARENESS_RADIUS = 50; // px
const BEHAVIOR = {
  normal: {
    speed: 1, // px per TIMESTEP
    rotation: 0.5,
  },
  excited: {
    speed: 2, // range of possible rotations in radians per TIMESTEP
    rotation: 2,
  },
};
const ESCAPE_TIME = 90; // seconds
const EXCITE_TIME = 5; // seconds

function generateInitialState(windowSize) {
  return {
    active: true,
    excited: false,
    x: Math.random() * windowSize.width,
    y: Math.random() * windowSize.height,
    direction: Math.random() * 2 * Math.PI,
    downtime: 1,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "timeStep":
      if (!state.active) {
        return state;
      }

      const behavior = state.excited ? BEHAVIOR.excited : BEHAVIOR.normal;

      let newX = state.x + behavior.speed * Math.cos(state.direction);
      let newY = state.y + behavior.speed * Math.sin(state.direction);
      let newDirection = state.direction + behavior.rotation * (Math.random() - 0.5);
      newDirection %= 2 * Math.PI;
      const maxX = action.windowSize.width - SIZE;
      const maxY = action.windowSize.height - SIZE;

      if (newX < 0) {
        newX = 0;
        if (newY < 0) {
          // top left corner
          newY = 0;
          newDirection = newDirection > 5 * Math.PI / 4 ? 0 : Math.PI / 2;
        } else if (newY > maxY) {
          // bottom left corner
          newY = maxY;
          newDirection = newDirection > 3 * Math.PI / 4 ? 3 * Math.PI / 2 : 0;
        } else {
          // left edge
          newDirection = newDirection > Math.PI ? 3 * Math.PI / 2 : Math.PI / 2;
        }
      } else if (newX > maxX) {
        newX = maxX;
        if (newY < 0) {
          // top right corner
          newY = 0;
          newDirection = newDirection > 7 * Math.PI / 4 ? Math.PI / 2 : Math.PI;
        } else if (newY > maxY) {
          // bottom right corner
          newY = maxY;
          newDirection = newDirection > Math.PI / 4 ? Math.PI : 3 * Math.PI / 2;
        } else {
          // right edge
          newDirection = newDirection > Math.PI ? 3 * Math.PI / 2 : Math.PI / 2;
        }
      } else {
        if (newY < 0) {
          // top edge
          newY = 0;
          newDirection = newDirection > 3 * Math.PI / 2 ? 0 : Math.PI;
        } else if (newY > maxY) {
          // bottom edge
          newY = maxY;
          newDirection = newDirection > Math.PI / 2 ? Math.PI : 0;
        }
      }

      return { ...state, x: newX, y: newY, direction: newDirection };

    case "scare":
      if (!state.active || state.excited) {
        return state;
      }

      setTimeout(
        () => action.dispatch({ type: "calm" }),
        EXCITE_TIME * 1000
      );

      return { ...state, excited: true };

    case "calm":
      return { ...state, excited: false };
    case "squash":
      if (!state.active) {
        return state;
      }

      setTimeout(
        () => action.dispatch({ type: "wakeUp" }),
        state.downtime * 1000
      );

      return { ...state, active: false, downtime: state.downtime + 1 };

    case "wakeUp":
      return { ...state, active: true };
    default:
      return state;
  }
}

function Bug(props) {
  const [state, dispatch] = useReducer(reducer, generateInitialState(props.windowSize));

  const handleTimeStep = useCallback(
    () => {
      dispatch({ type: "timeStep", windowSize: props.windowSize });
    },
    [props.windowSize]
  );

  useEffect(
    () => {
      const timeStepInterval = setInterval(handleTimeStep, TIMESTEP);
      return () => clearInterval(timeStepInterval);
    },
    [handleTimeStep]
  );

  const { id, appDispatch } = props;

  useEffect(
    () => {
      appDispatch({ type: state.active ? "awoke" : "squashed", key: id });

      if (state.active) {
        const escapeTimeout = setTimeout(
          () => {
            appDispatch({ type: "escaped", key: id });
          },
          ESCAPE_TIME * 1000
        );
        return () => clearTimeout(escapeTimeout);
      }
    },
    [state.active, id, appDispatch]
  );

  return (
    <>
      <div
        className="Bug"
        style={{
          left: state.x,
          top: state.y,
          height: SIZE,
          width: SIZE,
          boxShadow: state.active ? "0px 2px 6px rgba(0, 0, 0, 0.5)" : "0px 0px 3px rgba(0, 0, 0, 0.5)",
        }}
        onClick={() => dispatch({ type: "squash", dispatch: dispatch })}
      ></div>
      <div
        className="bugAwareZone"
        style={{
          left: state.x - AWARENESS_RADIUS,
          top: state.y - AWARENESS_RADIUS,
          height: AWARENESS_RADIUS * 2 + SIZE,
          width: AWARENESS_RADIUS * 2 + SIZE,
        }}
        onClick={() => dispatch({ type: "scare", dispatch: dispatch })}
      ></div>
    </>
    
  );
}

export default Bug;
