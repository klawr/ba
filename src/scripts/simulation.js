
const globalTestVariables = {
    cnv_width: 320,
    cnv_height: 180,
    txt1: undefined,
    txt2: undefined,
    txt3: undefined,
    startstopBtn: undefined,

    cnv1: undefined,

    ctx1: undefined,
    ctx2: undefined,
    ctx3: undefined,
    ctx_times: undefined,
    time_reset: undefined,
    time_first: undefined,
    times: [],
    hsv2rgb(h, s = 1, v = 1) {
        const c = s * v;
        const x = c * (1 - Math.abs(h / 60 % 2 - 1));
        const cnvrt = (rgb) => '#' + rgb.map(x => {
            return ("0" + Math.floor(x * 255).toString(16)).slice(-2);
        }).join('');
    
        switch (Math.floor(h / 60)) {
            case 0: return cnvrt([c, x, 0]);
            case 1: return cnvrt([x, c, 0]);
            case 2: return cnvrt([0, c, x]);
            case 3: return cnvrt([0, x, c]);
            case 4: return cnvrt([x, 0, c]);
            case 5: return cnvrt([c, 0, x]);
            default: return '#000';
        }
    },
    updateTimesChart() {
        if (!this.time_first) {
            this.time_first = performance.now();
            return g2();
        }
        const now = performance.now();
        this.times.push(
            (now - this.time_first) / 1000,
            1000 / (now - this.time_reset));

        return g2().view({ cartesian: true }).clr().chart({
            x: 35, y: 30, b: this.cnv_width - 50, h: this.cnv_height - 40,
            funcs: [{ data: this.times }],
            xaxis: { title: "Seconds" },
            yaxis: { title: "Hz" },
        });
    },

    rafId: undefined,

    g: g2().clr().view({ cartesian: true }),

    running: false,

    createElement({ tag }) {
        const elm = document.createElement(tag);

        Object.entries(arguments[0]).forEach(e => {
            elm[e[0]] = e[1];
        });

        document.body.appendChild(elm);

        return elm;
    },

    createElements() {
        this.startstopBtn = this.createElement({
            tag: "input",
            id: "startstop",
            type: "button",
            value: "Start/Stop"
        });

        this.createElement({
            tag: "input",
            type: "button",
            value: "Reload test",
        }).addEventListener('click', () => window.location.reload());

        this.txt1 = this.createElement({
            tag: "p",
            id: "txt1",
        });
        this.txt2 = this.createElement({
            tag: "p",
            id: "txt2",
        });
        this.txt3 = this.createElement({
            tag: "p",
            id: "txt3",
        });
        this.createElement({ tag: "br" });
        this.createElement({ tag: "br" });

        this.cnv1 = this.createElement({
            tag: "canvas",
            id: "cnv1",
            width: this.cnv_width,
            height: this.cnv_height
        })

        this.ctx1 = this.cnv1.getContext('2d');
        this.ctx2 = this.createElement({
            tag: "canvas",
            id: "cnv2",
            width: this.cnv_width,
            height: this.cnv_height,
        }).getContext('2d');
        this.ctx3 = this.createElement({
            tag: "canvas",
            id: "cnv3",
            width: this.cnv_width,
            height: this.cnv_height,
        }).getContext('2d');
        this.ctx_times = this.createElement({
            tag: "canvas",
            id: "cnv4",
            width: this.cnv_width,
            height: this.cnv_height,
        }).getContext('2d');

        this.createElement({ tag: "br" });
    },

    run(step) {
        this.model?.tick(1 / 60);
        this.g.exe(this.ctx1);
        this.time_reset = performance.now();
        step();
        this.updateTimesChart().exe(this.ctx_times);

        if (this.running) {
            this.rafId = requestAnimationFrame(() => {
                this.run(step)
            });
        }
    },

    register(fn) {
        const title = document.getElementById('title');
        const path = document.location.pathname;
        title.innerHTML = path.split('/').pop();
        title.target = "_blank";
        title.href = path;

        this.createElement({
            tag: "a",
            target: "_blank",
            innerHTML: "index.html",
            href: "../../index.html",
            style: "position: absolute; top: 5px; right: 5px",
        });

        window.addEventListener('load', () => {
            this.createElements();

            if (this.model) {
                mec.model.extend(this.model);

                const base = this.model.nodes.find(e => e.id === 'A0');
                this.txt1.innerHTML = `Tatsächlich: x: ${base.x}, y: ${base.y}`;

                this.model.init();
                this.model.draw(this.g);
            }

            this.run(fn);

            this.startstopBtn.addEventListener('click', () => {
                this.running = !this.running;
                this.run(fn);  // kick-off the simulation
            });
        });
    }
};
