const slides = {
    mensch: {
        title: "Was ist der Mensch?",
        slide: [
            null
        ]
    },
    wissen: {
        title: "Was kann ich wissen?",
        slide: [
            "Erkennen von Bewegung",
            "Kleinster umfassender Kreis",
            "Regressionsgeraden",
            "Optischer Fluss",
            "Shi-Tomasi",
            "Lucas-Kanade"
        ]
    },
    tun: {
        title: "Was kann ich tun?",
        slide: []
    },
    hoffen: {
        title: "Was kann ich hoffen?",
        slide: []
    }
}

function addSlide(id) {
    const div = document.createElement('div');
    div.id = '' + id;
    div.className = 'slide';

    return div;
}

function createSlides(slideNumber) {
    const arr = [];

    const sl = Object.values(slides)[slideNumber];

    const div = addSlide(0);

    const title = document.createElement('h1');
    title.innerHTML = sl.title;

    div.appendChild(title);
    div.appendChild(document.createElement('hr'));
    document.body.appendChild(div);
    arr.push(div);

    const ol = document.createElement('ol');
    sl.slide.forEach((s, i) => {
        const li = document.createElement('li');
        li.innerHTML = s;
        li.href = `#${i + 1}`;
        ol.appendChild(li);
        arr.push(createSlide(slideNumber, i + 1));
    });
div.appendChild(ol);

    return arr;
}

function createSlide(slide, subSlide) {
    const sl = Object.values(slides)[slide].slide;

    const div = addSlide(subSlide);

    if (sl[subSlide - 1]) {
        const title = document.createElement('h1');
        title.innerHTML = sl[subSlide - 1];
        div.appendChild(title);
        div.appendChild(document.createElement('hr'));
    }

    document.body.appendChild(div);

    return div;
}
