import { C } from "../../lib/constants";

const CloseBtn = ({ onClose }) => (
  <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: C.border, color: C.textSec, fontSize: 13, flexShrink: 0, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
);

export default CloseBtn;
