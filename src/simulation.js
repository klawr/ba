
let gnd1;
let gnd2;

let ctx1;
let ctx2;
let ctx3;

const g = g2().clr().view({ cartesian: true });

let running = false;

function createElement(tag, id, style, size, type, value) {
    const elm = document.createElement(tag);
    elm.id = id;
    if (type) elm.type = type;
    if (value) elm.value = value;
    if (style) elm.style = style;
    if (size) {
        elm.width = size[0];
        elm.height = size[1];
    }
    document.body.appendChild(elm);

    return elm;
}

function simulation(model, fn) {
    createElement("input", "btn", 0, 0, "button", "Start/Stop")
    gnd1 = createElement("div", "gnd1", "display:inline");
    gnd2 = createElement("div", "gnd2", "display:inline");
    createElement("br");
    createElement("br");

    ctx1 = createElement("canvas", "cnv1", 0, [320, 180]).getContext('2d');
    ctx2 = createElement("canvas", "cnv2", 0, [320, 180]).getContext('2d');
    ctx3 = createElement("canvas", "cnv3", 0, [320, 180]).getContext('2d');

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
