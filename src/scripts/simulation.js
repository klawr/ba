
document.getElementById('title').innerHTML =
    document.location.pathname.split('/').pop();

const global_test_variables = {
    cnv_width: 320,
    cnv_height: 180,
    gnd1: undefined,
    gnd2: undefined,
    gnd: new Gnd(),

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

        return g2().clr().view({ cartesian: true }).chart({
            x: 35, y: 30, b: this.cnv_width - 50, h: this.cnv_height - 40,
            funcs: [{ data: this.times }],
            xaxis: { title: "Seconds" },
            yaxis: { title: "Hz" },
        });
    },

    rafId: undefined,

    g: g2().clr().view({ cartesian: true }),

    running: false,
}

function createElement({ tag }) {
    const elm = document.createElement(tag);

    Object.entries(arguments[0]).forEach(e => {
        elm[e[0]] = e[1];
    });

    document.body.appendChild(elm);

    return elm;
}

function createElements() {
    const gtv = global_test_variables;

    gtv.startstopBtn = createElement({
        tag: "input",
        id: "startstop",
        type: "button",
        value: "Start/Stop"
    });
    resetBtn = createElement({
        tag: "input",
        id: "reset",
        type: "button",
        value: "Reset"
    });
    createElement({
        tag: "div",
        innerHTML: "cover",
        style: "display:inline;"
    })
    cover = createElement({
        tag: "input",
        id: "slider",
        type: "range",
        min: 0,
        max: 100,
        value: 0,
    });
    gtv.gnd1 = createElement({
        type: "div",
        id: "gnd1",
        style: "display:inline;"
    });
    gtv.gnd2 = createElement({
        type: "div",
        id: "gnd2",
        style: "display:inline"
    });
    createElement({ tag: "br" });
    createElement({ tag: "br" });

    gtv.cnv1 = createElement({
        tag: "canvas",
        id: "cnv1",
        width: gtv.cnv_width,
        height: gtv.cnv_height
    })

    gtv.ctx1 = gtv.cnv1.getContext('2d');
    gtv.ctx2 = createElement({
        tag: "canvas",
        id: "cnv2",
        width: gtv.cnv_width,
        height: gtv.cnv_height,
    }).getContext('2d');
    gtv.ctx3 = createElement({
        tag: "canvas",
        id: "cnv3",
        width: gtv.cnv_width,
        height: gtv.cnv_height,
    }).getContext('2d');
    gtv.ctx_times = createElement({
        tag: "canvas",
        id: "cnv4",
        width: gtv.cnv_width,
        height: gtv.cnv_height,
    }).getContext('2d');

    resetBtn.addEventListener('click', resetSimulation);

    cover.addEventListener('input', resetSimulation);
}

function run(step) {
    const gtv = global_test_variables;
    gtv.g.exe(gtv.ctx1);
    model.tick(1 / 60);
    step();
    gtv.updateTimesChart().exe(gtv.ctx_times);

    if (gtv.running) {
        gtv.rafId = requestAnimationFrame(() => {
            gtv.time_reset = performance.now();
            run(step)
        });
    }
}

function simulation(model, step) {
    const gtv = global_test_variables;

    createElements();

    mec.model.extend(model);                    // extend the model

    const base = model.nodes.find(e => e.id === 'A0');
    gtv.gnd1.innerHTML = `Tatsächlich: x: ${base.x}, y: ${base.y}`;

    gtv.startstopBtn.addEventListener('click', () => {
        gtv.running = !gtv.running;
        gtv.running && run(step);  // kick-off the simulation
    });

    model.init();                               // initialize it

    resetSimulation();
    run(step);
}

function resetSimulation() {
    const gtv = global_test_variables;

    gtv.running = false;
    gtv.gnd = new Gnd();
    gtv.gnd2.innerHTML = "";
    gtv.temp_image = undefined;
    gtv.last_time = undefined;
    gtv.times = [];

    gtv.reset && gtv.reset();
    model.reset();
    cancelAnimationFrame(gtv.rafId);

    g2().clr().exe(gtv.ctx1).exe(gtv.ctx2).exe(gtv.ctx3).exe(gtv.ctx_times);

    gtv.g = g2().clr().view({ cartesian: true });
    model.draw(gtv.g);

    gtv.g.cir({
        ...model.nodeById("A0"),
        r: () => cover.value,
        fs: 'red',
        ls: '@fs'
    });
}

function register(model, fn) {
    const btn = createElement({
        tag: "input",
        type: "button",
        value: "Click to load test",
        style: {
            height: 200,
            width: 400,
        },
    });
    btn.addEventListener('click', () => {
        simulation(model, fn);
        document.body.removeChild(btn);
    });
    document.body.appendChild(btn);
}
