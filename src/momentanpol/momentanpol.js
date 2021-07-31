const globalMomentanpol1Variables = {
    lines: [],
    poles: [],
    i: 0,
    r: 20,
    g2() {
        return g2().cir({ x: 0, y: 0, r: this.r, ld: [3, 0, 3] }).bar({ x1: -this.r, x2: this.r, y1: 0, y2: 0 })
    },
    data: { x: {}, y: {}, },
    addDataPoint(a) {
        if (!a) return;
        const x = Math.round(a.x);
        const y = Math.round(a.y);
        this.data.x[x] = this.data.x[x] ? this.data.x[x] + 1 : 1;
        this.data.y[y] = this.data.y[y] ? this.data.y[y] + 1 : 1;
    },
    getChart(showX = true, showY = true) {
        const align = (arr, limit) => Object.entries(arr)
            .filter(e => limit ? (+e[0] > 0 && +e[0] < limit) : true)
            .sort((a, b) => +a[0] > +b[0])
            .flatMap(e => [+e[0], e[1]]);

        const x = showX ? align(this.data.x, globalTestVariables.cnv_width) : [];
        const y = showY ? align(this.data.y, globalTestVariables.cnv_height) : [];

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: 280, h: 150,
            funcs: [{ data: x }, { data: y }],
            xaxis: {},
            yaxis: {},
        });
    },
}

globalTestVariables.reset = function () {
    globalMomentanpol1Variables.lines = [];
    globalMomentanpol1Variables.poles = [];
    globalMomentanpol1Variables.i = 0;
    globalMomentanpol1Variables.data.x = {};
}

function roll() {
    const gmv = globalMomentanpol1Variables;
    const { cnv_height } = globalTestVariables;

    const w = gmv.i / 180 * Math.PI;
    gtv.g.del().clr()
        .use({ x: gmv.r * 2 + gmv.r * w, y: cnv_height / 2, grp: gmv.g2(), w });
    ++gmv.i;
}