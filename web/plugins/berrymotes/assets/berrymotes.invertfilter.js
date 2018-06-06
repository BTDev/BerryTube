var svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgRoot.setAttribute("version", "1.1");
svgRoot.setAttribute("baseProfile", "full");
svgRoot.setAttribute("style", "width: 0px; height: 0px;");

var svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
svgFilter.setAttribute("id", "bem-hue-rotate");
svgFilter.setAttribute("color-interpolation-filters", "sRGB");
svgRoot.appendChild(svgFilter);

var svgMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
svgMatrix.setAttribute("type", "hueRotate");
svgMatrix.setAttribute("values", "180");
svgFilter.appendChild(svgMatrix);

document.body.appendChild(svgRoot);



svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgRoot.setAttribute("version", "1.1");
svgRoot.setAttribute("baseProfile", "full");
svgRoot.setAttribute("style", "width: 0px; height: 0px;");

svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
svgFilter.setAttribute("id", "bem-invert");
svgFilter.setAttribute("color-interpolation-filters", "sRGB");
svgRoot.appendChild(svgFilter);

svgMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
svgMatrix.setAttribute("type", "matrix");
svgMatrix.setAttribute("values", "-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0");
svgFilter.appendChild(svgMatrix);

document.body.appendChild(svgRoot);

var css = document.createElement("style");
css.type = "text/css";
css.innerHTML = ".bem-invert { filter:url(#bem-invert); } .bem-hue-rotate { filter:url(#bem-hue-rotate); } ";
document.body.appendChild(css);