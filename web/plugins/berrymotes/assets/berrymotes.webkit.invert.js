/*
 * Copyright (C) 2013 Marminator <cody_y@shaw.ca>
 *
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * COPYING for more details.
 */
var css = document.createElement("style");
css.type = "text/css";
css.innerHTML = ".bem-invert { -webkit-filter: invert(100%); } .bem-hue-rotate { -webkit-filter: hue-rotate(180deg); } ";
document.body.appendChild(css);