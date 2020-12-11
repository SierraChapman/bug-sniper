import './style.css';

function ReloadMessage(props) {

  return (
    <div className="reload-message" style={{ opacity: props.display ? 1 : 0 }}>PRESS [SPACE] TO RELOAD</div>
  );
}

export default ReloadMessage;
