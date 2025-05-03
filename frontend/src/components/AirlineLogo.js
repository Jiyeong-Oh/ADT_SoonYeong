// AirlineLogo.js
import React from "react";

const AirlineLogo = React.memo(({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    className="airline-logo"
    onError={(e) => { e.target.src = "/images/blank.png"; }}
  />
));

export default AirlineLogo;
