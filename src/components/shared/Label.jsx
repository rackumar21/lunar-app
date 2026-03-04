import { C, F } from "../../lib/constants";

const Label = ({ children, mb = 10 }) => (
  <p style={{ fontFamily: F.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textMuted, marginBottom: mb }}>{children}</p>
);

export default Label;
