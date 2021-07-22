
class Gnd {
    x = 0;
    y = 0;
    confident = false;
    past = [];
    get last_estimate() {
        return this.past[this.past.length - 1];
    }

    data = {
        x: {},
        y: {},
    };
    addDataPoint(a) {
        const x = Math.round(a.x);
        const y = Math.round(a.y);
        this.data.x[x] = this.data.x[x] ? this.data.x[x] + 1 : 1;
        this.data.y[y] = this.data.y[y] ? this.data.y[y] + 1 : 1;
    };
    getChart() {
        const x = Object.entries(this.data.x).flatMap(e => [+e[0], e[1]]);
        const y = Object.entries(this.data.y).flatMap(e => [+e[0], e[1]]);

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: 280, h: 150,
            funcs: [{ data: x }, { data: y }],
            xaxis: {},
            yaxis: {},
        });
    }

    add(a, threshold) {
        this.addDataPoint(a);
        if (this.past.push(a) > 10) {
            this.past.shift();
        };

        this.checkConfidence(threshold);
    }

    checkConfidence(threshold = 0.5) {
        let acc = 0;
        for (let i = 1; i < this.past.length; ++i) {
            const pre = this.past[i - 1];
            const cur = this.past[i];
            acc += Math.hypot(cur.x - pre.x, cur.y - pre.y);
        }

        if (this.past.length === 10 && acc < threshold) {
            this.confident = true;
            this.x = this.past[this.past.length - 1].x;
            this.y = this.past[this.past.length - 1].y;
        }
    }

}
