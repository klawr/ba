
class Gnd {
    setRef(ref) {
        Object.keys(ref).forEach(key => {
            this[key] = ref[key];
        });
    }

    x = 0;
    y = 0;
    confident = false;
    past = [];
    get last_estimate() {
        return this.past[this.past.length - 1];
    }

    data = { x: {}, y: {}, };
    addDataPoint(a) {
        if (!a) return;
        const x = Math.round(a.x);
        const y = Math.round(a.y);
        this.data.x[x] = this.data.x[x] ? this.data.x[x] + 1 : 1;
        this.data.y[y] = this.data.y[y] ? this.data.y[y] + 1 : 1;
    };
    getChart() {
        const align = (arr, limit) => Object.entries(arr)
            .filter(e => limit ? (+e[0] > 0 && +e[0] < limit) : true)
            .sort((a, b) => +a[0] > +b[0])
            .flatMap(e => [+e[0], e[1]]);

        const x = align(this.data.x, 320); // Canvas width
        const y = align(this.data.y, 180); // Canvas height

        return g2().clr().view({ cartesian: true }).chart({
            x: 20, y: 20, b: 280, h: 150,
            funcs: [{ data: x }, { data: y }],
            xaxis: {},
            yaxis: {},
        });
    }

    add(a, threshold) {
        if (!a) return;

        if (!this.confident) {
            this.addDataPoint(a);
        }
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
