
const globalTestVariables = {
    cnv_width: 320,
    cnv_height: 180,
    txt1: undefined,
    txt2: undefined,

    startstopBtn: undefined,
    reset: undefined, // filled by tests

    cnv1: undefined,

    ctx1: undefined,
    ctx2: undefined,
    ctx3: undefined,
    ctx_times: undefined,
    time_reset: undefined,
    time_first: undefined,
    times: [],
    updateTimesChart() {
        if (!this.time_reset) {
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
        resetBtn = this.createElement({
            tag: "input",
            id: "reset",
            type: "button",
            value: "Reset"
        });
        this.createElement({
            tag: "div",
            innerHTML: "cover",
            style: "display:inline;"
        })
        cover = this.createElement({
            tag: "input",
            id: "slider",
            type: "range",
            min: 0,
            max: 100,
            value: 0,
        });
        this.txt1 = this.createElement({
            type: "div",
            id: "txt1",
            style: "display:inline;"
        });
        this.txt2 = this.createElement({
            type: "div",
            id: "txt2",
            style: "display:inline"
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
        this.createElement({
            tag: "input",
            type: "button",
            value: "reload",
        }).addEventListener('click', () => window.location.reload());

        resetBtn.addEventListener('click', () => this.resetSimulation());

        cover.addEventListener('input', () => this.resetSimulation());
    },

    run(step) {
        this.model?.tick(1 / 60);
        this.g.exe(this.ctx1);
        step();
        this.updateTimesChart().exe(this.ctx_times);

        if (this.running) {
            this.rafId = requestAnimationFrame(() => {
                this.time_reset = performance.now();
                this.run(step)
            });
        }
    },

    resetSimulation() {
        this.running = false;
        if (this.txt2) this.txt2.innerHTML = "";
        this.temp_image = undefined;
        this.last_time = undefined;
        this.times = [];

        this.g = g2().clr().view({ cartesian: true });

        this?.reset();
        if (this.model) {
            this.model.reset();
            this.model.draw(this.g);

            this.g.cir({
                ...this.model.nodeById("A0"),
                r: () => cover.value,
                fs: 'red',
                ls: '@fs'
            });
        }

        cancelAnimationFrame(this.rafId);

        g2().clr().exe(this.ctx1).exe(this.ctx2).exe(this.ctx3).exe(this.ctx_times);

    },
    register(fn) {
        const title = document.getElementById('title');
        const path = document.location.pathname;
        title.innerHTML = path.split('/').pop();
        title.href = path;


        const btn = this.createElement({
            tag: "input",
            type: "button",
            value: "Click to load test",
            style: {
                height: 200,
                width: 400,
            },
        });
        btn.addEventListener('click', () => {
            this.createElements();

            if (this.model) {
                mec.model.extend(this.model);

                // TODO das sollte hier weg.
                const base = this.model.nodes.find(e => e.id === 'A0');
                this.txt1.innerHTML = `Tatsächlich: x: ${base.x}, y: ${base.y}`;

                this.model.init();
            }

            this.startstopBtn.addEventListener('click', () => {
                this.running = !this.running;
                this.run(fn);  // kick-off the simulation
            });
            this.resetSimulation();
            this.run(fn);
            document.body.removeChild(btn);
        });
        document.body.appendChild(btn);
    }
};
