function createElement({ tag }) {
    const elm = document.createElement(tag);

    Object.entries(arguments[0]).forEach(e => {
        elm[e[0]] = e[1];
    });

    document.body.appendChild(elm);

    return elm;
}

function createElements() {
    const gtv = globalTestVariables;

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