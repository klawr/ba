/*
 * Copyright (c) 2013-2020 Andrei Kashcha (anvaka@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, merge, 
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons 
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
*/

const toDegree = 180 / Math.PI;
function fromArgb(a, r, g, b) {
    return 'rgba(' + [r, g, b, a/255].join(',') + ')';
}
function convertHsvToRgb(h, s, v) {
    let a, b, c, d, hueFloor;
    h = h / 360;
    if (s > 0) {
        if (h >= 1) {
            h = 0;
        }
        h = 6 * h;
        hueFloor = Math.floor(h);
        a = Math.round(255 * v * (1.0 - s));
        b = Math.round(255 * v * (1.0 - (s * (h - hueFloor))));
        c = Math.round(255 * v * (1.0 - (s * (1.0 - (h - hueFloor)))));
        d = Math.round(255 * v);

        switch (hueFloor) {
            case 0: return fromArgb(255, d, c, a);
            case 1: return fromArgb(255, b, d, a);
            case 2: return fromArgb(255, a, d, c);
            case 3: return fromArgb(255, a, b, d);
            case 4: return fromArgb(255, c, a, d);
            case 5: return fromArgb(255, d, a, b);
            default: return fromArgb(0, 0, 0, 0);
        }
    }
    d = v * 255;
    return fromArgb(255, d, d, d);
}

function getDirectionalColor(x, y) {
    const hue = (Math.atan2(y, x) * toDegree + 360) % 360;
    return convertHsvToRgb(hue, 1, 1);
}