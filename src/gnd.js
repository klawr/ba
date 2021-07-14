
class Gnd {
    x = 0;
    y = 0;
    confident = false;
    past = [];
    get last_estimate() {
        return this.past[this.past.length - 1];
    }

    add(a, threshold) {
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
