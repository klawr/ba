const globalMomentanpol1Variables = {
    lines: [],
    i: 0,
    r: 50,
    g2() {
        return g2().bar({ x1: -this.r, x2: this.r, y1: 0, y2: 0 })
    },
}

globalTestVariables.reset = function() {
    globalMomentanpol1Variables.lines = [];
    globalMomentanpol1Variables.i = 0;
}

function roll() {
    const gmv = globalMomentanpol1Variables;
    
    const w = gmv.i / 180 * Math.PI;
    gtv.g.del().clr().use({ x: gmv.r * w, y: gmv.r * 1.5, grp: gmv.g2(), w });
    ++gmv.i;
}