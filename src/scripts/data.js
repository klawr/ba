class Data {
    dataX = {};
    dataY = {};

    reset() {
        this.dataX = {};
        this.dataY = {};
    }

    addDataPoint(a) {
        if (!a) return;
        const x = Math.round(a.x);
        const y = Math.round(a.y);
        this.dataX[x] = this.dataX[x] ? this.dataX[x] + 1 : 1;
        this.dataY[y] = this.dataY[y] ? this.dataY[y] + 1 : 1;
    };

    getChart(showX = true, showY = true) {
        const align = (arr, limit) => Object.entries(arr)
            .filter(e => limit ? (+e[0] > 0 && +e[0] < limit) : true)
            .sort((a, b) => +a[0] > +b[0])
            .flatMap(e => [+e[0], e[1]]);

        const x = showX ? align(this.dataX, globalTestVariables.cnv_width) : [];
        const y = showY ? align(this.dataY, globalTestVariables.cnv_height) : [];

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: 280, h: 150,
            funcs: [{ data: x }, { data: y }],
            xaxis: {},
            yaxis: {},
        });
    };

    get muY() {
        return Data.mu(this.dataY);
    }

    get muX() {
        return Data.mu(this.dataX);
    }

    static mu(arg) {
        let length = 0;
        return Array.isArray(arg) ?
            arr.reduce((pre, cur) => pre + cur) / arr.length :
            Object.entries(arg).reduce((pre, cur) => {
                length += cur[1];
                return pre + +cur[0] * cur[1];
            }, 0) / length;
    }
}