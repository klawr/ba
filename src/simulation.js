
document.getElementById('title').innerHTML =
    document.location.pathname.split('/').pop();

const cnv_width = 320;
const cnv_height = 180;

let gnd1;
let gnd2;

const gnd = new Gnd();

let ctx1;
let ctx2;
let ctx3;


let rafId;

const g = g2().view({ cartesian: true });

let running = false;

function createElement({ tag }) {
    const elm = document.createElement(tag);

    Object.entries(arguments[0]).forEach(e => {
        elm[e[0]] = e[1];
    });

    document.body.appendChild(elm);

    return elm;
}

function createElements() {
    createElement({
        tag: "input",
        id: "startstop",
        type: "button",
        value: "Start/Stop"
    });
    createElement({
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
    gnd1 = createElement({
        type: "div",
        id: "gnd1",
        style: "display:inline;"
    });
    gnd2 = createElement({
        type: "div",
        id: "gnd2",
        style: "display:inline"
    });
    createElement({ tag: "br" });
    createElement({ tag: "br" });

    createElement({
        tag: "canvas",
        id: "cnv1",
        width: cnv_width,
        height: cnv_height
    });
    ctx1 = cnv1.getContext('2d');
    ctx2 = createElement({
        tag: "canvas",
        id: "cnv2",
        width: cnv_width,
        height: cnv_height,
    }).getContext('2d');
    ctx3 = createElement({
        tag: "canvas",
        id: "cnv3",
        width: cnv_width,
        height: cnv_height,
    }).getContext('2d');
}

function simulation(model, step) {
    createElements();

    mec.model.extend(model);                    // extend the model

    const base = model.nodes.find(e => e.id === 'A0');
    gnd1.innerHTML = `Tatsächlich: x: ${base.x}, y: ${base.y}`;

    const startStopBtn = document.getElementById('startstop');
    startStopBtn.addEventListener('click', () => {
        running = !running;
        running && step(fn);  // kick-off the simulation
    });

    const resetBtn = document.getElementById('reset');
    resetBtn.addEventListener('click', resetSimulation);

    cover.addEventListener('input', resetSimulation);

    model.init();                               // initialize it

    prerender();
    step();
}

let reset; // used to add stuff to reset
function resetSimulation() {
    model.reset();
    reset && reset();
    gnd.reset();
    running = false;
    cancelAnimationFrame(rafId);
    g.exe(ctx1);
    prerender();
}

function prerender() {
    step_compare_images(fn);
    g.clr();
    model.draw(g);                              // append model-graphics to graphics-obj

    g.cir({
        ...model.nodeById("A0"),
        r: () => cover.value,
        fs: 'red',
        ls: '@fs'
    }).exe(ctx1);
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


function step_compare_images(fn) {
    const image1 = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    model.tick(1 / 60); // solve model with fixed stepping
    g.exe(ctx1);
    const image2 = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    const result = compare_images(image1, image2, cnv1.width, cnv1.height);

    fn?.call(undefined, result);

    if (gnd.confident) {
        gnd2.innerHTML = `Vermutet: x: ${gnd.x}, y: ${cnv1.height - gnd.y}`;
    }

    if (running) {
        rafId = requestAnimationFrame(() => step_compare_images(fn));  // keep calling back
    }
}
