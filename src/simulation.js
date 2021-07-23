
let gnd1;
let gnd2;

let ctx1;
let ctx2;
let ctx3;

const g = g2().clr().view({ cartesian: true });

let running = false;

function createElement({ tag }) {
    const elm = document.createElement(tag);

    Object.entries(arguments[0]).forEach(e => {
        elm[e[0]] = e[1];
    });

    document.body.appendChild(elm);

    return elm;
}

function simulation(model, fn) {
    createElement({
        tag: "input",
        id: "btn",
        type: "button",
        value: "Start/Stop"
    });
    createElement({
        tag: "input",
        id: "slider",
        type: "range",
    });
    gnd1 = createElement({
        type: "div",
        id: "gnd1",
        style: "display:inline"
    });
    gnd2 = createElement({
        type: "div",
        id: "gnd2",
        style: "display:inline"
    });
    createElement({ tag: "br" });
    createElement({ tag: "br" });

    ctx1 = createElement({
        tag: "canvas",
        id: "cnv1",
        width: 320,
        height: 180
    }).getContext('2d');
    ctx2 = createElement({
        tag: "canvas",
        id: "cnv2",
        width: 320,
        height: 180,
    }).getContext('2d');
    ctx3 = createElement({
        tag: "canvas",
        id: "cnv3",
        width: 320,
        height: 180,
    }).getContext('2d');

    mec.model.extend(model);                    // extend the model

    const base = model.nodes.find(e => e.id === 'A0');
    gnd1.innerHTML = `Tatsächlich: x: ${base.x}, y: ${base.y}`;

    const btn = document.getElementById('btn');
    btn.addEventListener('click', () => {
        running = !running;
        running && step(fn);  // kick-off the simulation
    });

    model.init();                               // initialize it
    model.draw(g);                              // append model-graphics to graphics-obj
    g.exe(ctx1);
    step(fn);
}

function step(fn) {
    const image1 = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    model.tick(1 / 60); // solve model with fixed stepping
    g.exe(ctx1);
    const image2 = ctx1.getImageData(0, 0, cnv1.width, cnv1.height).data;
    const result = compare_images(image1, image2, cnv1.width, cnv1.height);

    fn(result);

    if (running) {
        requestAnimationFrame(() => step(fn));  // keep calling back
    }
}
