function group(div) {
    const cnv1 = document.createElement('canvas');
    cnv1.width = document.body.clientWidth / 4;
    cnv1.height = cnv1.width;
    const cnv2 = document.createElement('canvas');
    cnv2.width = cnv1.width;
    cnv2.height = cnv1.height;
    const ctx1 = cnv1.getContext('2d');
    const ctx2 = cnv2.getContext('2d');

    const model = {
        gravity: true,
        nodes: [
            { 'id': 'A0', 'x': 70, 'y': 70, 'base': true },
            { 'id': 'A1', 'x': 70, 'y': 120 },
            { 'id': 'B1', 'x': 220, 'y': 150 },
            { 'id': 'B0', 'x': 220, 'y': 70, 'base': true },
        ],
        constraints: [
            { id: 'a', p1: 'A0', p2: 'A1', len: { type: 'const' }, ori: { type: 'drive', Dw: 100, Dt: 50 } },
            { id: 'b', p1: 'B0', p2: 'B1', len: { type: 'const' } },
            { id: 'c', p1: 'B1', p2: 'A1', len: { type: 'const' } }
        ]
    };

    mec.model.extend(model);
    model.init();
    const g = g2().del().clr().view({ cartesian: true, scl: 2 });
    model.draw(g);


    let temp_image;
    let toggle = false;

    function render() {
        if (!toggle) return;

        const new_image = cnv1.getContext('2d').getImageData(0, 0, cnv1.width, cnv1.height).data;
        if (!temp_image) {
            temp_image = new_image;
        }
        const result = PointCloud.fromImages(
            temp_image, new_image, cnv1.width, cnv1.height);
            const filtered = result.removeOverlaps(10);
        const h = g2().clr();

        const dijkstras = new Dijkstra(filtered);
        dijkstras.draw(h);
        dijkstras.groupsByCorrelation(h);
        filtered.draw(h);

        model.tick(1 / 60);

        g.exe(ctx1);
        h.exe(ctx2);

        if (toggle) {
            requestAnimationFrame(render);
        }
    }

    const btn = document.createElement("button");
    btn.innerHTML = "Start / Stop";
    render();
    btn.addEventListener('click', () => {
        toggle = !toggle;
        render();
    });
    div.appendChild(cnv1);
    div.appendChild(btn);
    div.appendChild(cnv2);
}