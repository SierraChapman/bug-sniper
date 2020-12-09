import './style.css';

function ReloadMessage(props) {

  return (
    <div className="reload-message" style={{ display: props.display ? "block" : "none" }}>PRESS [SPACE] TO RELOAD</div>
  );
}

export default ReloadMessage;
