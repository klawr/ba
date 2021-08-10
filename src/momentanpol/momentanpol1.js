const globalMomentanpol1Variables = {
    data: new DataXY(),
    group: new Group({ lk: { maxCorners: 1 } }),
    i: 0,
    r: 20,
    draw() {
        return g2().cir({ x: 0, y: 0, r: this.r, ld: [3, 0, 3] })
            .bar({ x1: -this.r, x2: this.r, y1: 0, y2: 0 })
            .nod({ x: -this.r, y: 0 })
            .nod({ x: this.r, y: 0 });
    },
}

globalTestVariables.reset = function () {
    globalMomentanpol1Variables.group.reset();
    globalMomentanpol1Variables.i = 0;
    globalMomentanpol1Variables.data.reset();
}

function roll(n = 1) {
    const gmv = globalMomentanpol1Variables;
    const { cnv_height, g } = globalTestVariables;

    const w = globalMomentanpol1Variables.i / 180 * Math.PI;
    g.del().clr()
        .use({
            x: gmv.r * 2 + gmv.r * w,
            y: cnv_height / 2,
            grp: gmv.draw(), w
        });
    gmv.i += n;
}