class Data {
    dataX = {};
    dataY = {};

    setRef(ref) {
        Object.keys(ref).forEach(key => {
            this[key] = ref[key];
        })
    }

    reset() {
        this.dataX = {};
        this.dataY = {};
    }

    add(a) {
        return this.addDataPoint(a);
    }

    addDataPoint(a) {
        if (!a) return;

        const x = Math.round(a.x);
        const y = Math.round(a.y);
        if (Number.isSafeInteger(x) &&
            x < globalTestVariables.cnv_width &&
            x > 0) {
            this.dataX[x] = this.dataX[x] ? this.dataX[x] + 1 : 1;
        }
        if (Number.isSafeInteger(y) &&
            y < globalTestVariables.cnv_height &&
            y > 0) {
            this.dataY[y] = this.dataY[y] ? this.dataY[y] + 1 : 1;
        }
    };

    getChart(showX = true, showY = true) {
        const gtv = globalTestVariables;

        const align = (arg, limit) => {
            const length = Data.getNumberOfInputs(arg);
            return Object.entries(arg)
                .filter(e => limit ? (+e[0] > 0 && +e[0] < limit) : true)
                .sort((a, b) => +a[0] > +b[0])
                .flatMap(e => [+e[0], e[1] / length])
        };


        const x = showX ? align(this.dataX, gtv.cnv_width) : [];
        const y = showY ? align(this.dataY, gtv.cnv_height) : [];
        const fnX = showX ?
            (i) => this.gaussianDistribution(i, this.dataX) :
            () => { };

        const fnY = showY ?
            (i) => this.gaussianDistribution(i, this.dataY) :
            () => { };

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: 280, h: 150,
            funcs: [
                { data: x },
                { data: y },
                { fn: fnY, dx: 1 },
                { fn: fnX, dx: 1 }
            ],
            xaxis: {},
            yaxis: {},
        });
    };

    drawDeviation(g) {
        const sigmaX = this.deviationX;
        const sigmaY = this.deviationY;
        const x = this.muX;
        const y = this.muY;


        for (let i = 0; i < 6; ++i) {
            g.ell({ x, y, rx: sigmaX * i, ry: sigmaY * i });
        }
    }

    gaussianDistribution(i, arg) {
        if (!arg) return [];

        const mu = Data.mu(arg);
        const variance = Data.variance(arg);

        const nominator = Math.exp(-((i - mu) ** 2) / (2 * variance));
        const denominator = Math.sqrt(2 * Math.PI * variance);

        return nominator / denominator;
    }

    get muY() {
        return Data.mu(this.dataY);
    }

    get muX() {
        return Data.mu(this.dataX);
    }

    static mu(arg) {
        let length = 0;
        return Array.isArray(arg) ?
            arg.reduce((pre, cur) => pre + cur, 0) / arg.length :
            Object.entries(arg).reduce((pre, cur) => {
                length += cur[1];
                return pre + +cur[0] * cur[1];
            }, 0) / length;
    }

    static getNumberOfInputs(arg) {
        return Array.isArray(arg) ?
            arg.length :
            Object.entries(arg).reduce((pre, cur) => pre += cur[1], 0);
    }

    static variance(arg) {
        const mu = Data.mu(arg);

        let length = 0;
        return Array.isArray(arg) ?
            arg.reduce((pre, cur) => pre + ((cur - mu) ** 2), 0) / (arg.length - 1) :
            Object.entries(arg).reduce((pre, cur) => {
                length += cur[1];
                return pre + (((+cur[0] - mu) ** 2) * (+cur[1]));
            }, 0) / (length - 1);
    }

    static deviation(arg) {
        return Math.sqrt(Data.variance(arg));
    }

    get deviationX() {
        return Data.deviation(this.dataX);
    }

    get deviationY() {
        return Data.deviation(this.dataY);
    }

    get varianceX() {
        return Data.variance(this.dataX);
    }

    get varianceY() {
        return Data.variance(this.dataY);
    }
}