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

function FlowZone(x, y, u, v) {
    this.x = x;
    this.y = y;
    this.u = u;
    this.v = v;
}

function lucas_kanade(oldImage, newImage, width, height, step=2) {
    const zones = [];
    const winStep = step * 2 + 1;

    let A2, A1B2, B1, C1, C2;
    let u, v, uu, vv;
    uu = vv = 0;
    const wMax = width - step - 1;
    const hMax = height - step - 1;
    let globalY, globalX, localY, localX;

    for (globalY = step + 1; globalY < hMax; globalY += winStep) {
        for (globalX = step + 1; globalX < wMax; globalX += winStep) {
            A2 = A1B2 = B1 = C1 = C2 = 0;

            for (localY = -step; localY <= step; localY++) {
                for (localX = -step; localX <= step; localX++) {
                    const address = (globalY + localY) * width + globalX + localX;

                    const gradX = (newImage[(address - 1) * 4]) - (newImage[(address + 1) * 4]);
                    const gradY = (newImage[(address - width) * 4]) - (newImage[(address + width) * 4]);
                    const gradT = (oldImage[address * 4]) - (newImage[address * 4]);

                    A2 += gradX * gradX;
                    A1B2 += gradX * gradY;
                    B1 += gradY * gradY;
                    C2 += gradX * gradT;
                    C1 += gradY * gradT;
                }
            }

            const delta = (A1B2 * A1B2 - A2 * B1);

            if (delta !== 0) {
                /* system is not singular - solving by Kramer method */
                const iDelta = step / delta;
                const deltaX = -(C1 * A1B2 - C2 * B1);
                const deltaY = -(A1B2 * C2 - A2 * C1);

                u = deltaX * iDelta;
                v = deltaY * iDelta;
            } else {
                /* singular system - find optical flow in gradient direction */
                const norm = (A1B2 + A2) * (A1B2 + A2) + (B1 + A1B2) * (B1 + A1B2);
                if (norm !== 0) {
                    const iGradNorm = step / norm;
                    const temp = -(C1 + C2) * iGradNorm;

                    u = (A1B2 + A2) * temp;
                    v = (B1 + A1B2) * temp;
                } else {
                    u = v = 0;
                }
            }

            if ((u !== 0 || v !== 0) &&
                -step < u && u < step &&
                -step < v && v < step) {
                uu += u;
                vv += v;
                zones.push(new FlowZone(globalX, globalY, u, v));
            }
        }
    }

    return {
        zones: zones,
        u: uu / zones.length,
        v: vv / zones.length
    };
};
