class Data {
    data = {};

    get length() {
        return Object.values(this.data).reduce((p, c) => c + p, 0);
    }

    reset() {
        this.data = {};
    }

    fillText(p, name, off = 0) {
        const r = (i) => Math.abs(Math.round(i * 10) / 10);
        p.innerHTML = `${name}: Erwartungswert: ${r(this.mu - off)}, Varianz: ${r(this.variance)}, Anzahl: ${this.length}`;
    }

    add(a) {
        if (!a) return;

        const r = Math.round(a);
        if (Number.isSafeInteger(r)) {
            this.data[r] = this.data[r] ? this.data[r] + 1 : 1;
        }
    };

    /**
     * Function used by g2.chart to draw the gaussian distribution.
     * @param {number} x is the number on the x axis
     * @returns y Value
     */
    gaussianDistribution(x) {
        const mu = this.mu;
        const variance = this.variance;
        const nominator = Math.exp(-((x - mu) ** 2) / (2 * variance));
        const denominator = Math.sqrt(2 * Math.PI * variance);
        return nominator / denominator;
    }

    get mu() {
        return Object.entries(this.data)
            .reduce((pre, cur) => pre + cur[0] * cur[1], 0)
            / this.length;
    }

    get variance() {
        const mu = this.mu;

        return Object.entries(this.data)
            .reduce((pre, cur) =>
                pre + (((+cur[0] - mu) ** 2) * (+cur[1])), 0)
            / (this.length - 1);
    }

    get deviation() {
        return Math.sqrt(this.variance);
    }

    alignForChart(limit = false) {
        let length = this.length;

        return Object.entries(this.data)
            .filter(e => limit ? (+e[0] > 0 && +e[0] < limit) : true)
            .sort((a, b) => +a[0] > +b[0])
            .flatMap(e => [+e[0], e[1] / length]);
    }

    getChart(limit) {
        const gtv = globalTestVariables;
        const data = this.alignForChart(limit);
        const fn = (i) => this.gaussianDistribution(i);

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: gtv.cnv_width - 40, h: gtv.cnv_height - 30,
            funcs: [{ data }, { fn, dx: 1 },],
            xaxis: {}, yaxis: {},
        });
    };
}

class DataXY {
    x = new Data();
    y = new Data();

    constructor(pts) {
        if (pts) {
            pts.forEach(p => this.add(p));
        }
    }

    reset() {
        this.x.reset();
        this.y.reset();
    }

    fillText(el1, el2) {
        this.x.fillText(el1, "x");
        this.y.fillText(el2, "y", globalTestVariables.cnv_height);
    }

    add(a) {
        if (!a) return;

        const gtv = globalTestVariables;

        if (a.x > 0 && a.y > 0 &&
            a.x < gtv.cnv_width &&
            a.y < gtv.cnv_height) {
            this.x.add(a.x);
            this.y.add(a.y);
        }
    };

    getChart(showX = true, showY = true) {
        const gtv = globalTestVariables;

        const x = showX ? this.x.alignForChart(gtv.cnv_width) : [];
        const y = showY ? this.y.alignForChart(gtv.cnv_height) : [];

        const fnX = showX ?
            (i) => this.x.gaussianDistribution(i) :
            () => { };
        const fnY = showY ?
            (i) => this.y.gaussianDistribution(i) :
            () => { };

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: gtv.cnv_width - 40, h: gtv.cnv_height - 30,
            funcs: [{ data: x }, { data: y },
            { fn: fnY, dx: 1 }, { fn: fnX, dx: 1 }
            ],
            xaxis: {}, yaxis: {},
        });
    };

    get mu() {
        return { x: this.x.mu, y: this.y.mu };
    }

    drawDeviation(g) {
        const sigmaX = this.x.deviation;
        const sigmaY = this.y.deviation;
        const x = this.x.mu;
        const y = this.y.mu;


        for (let i = 0; i < 6; ++i) {
            g.ell({ x, y, rx: sigmaX * i, ry: sigmaY * i });
        }
    }
}