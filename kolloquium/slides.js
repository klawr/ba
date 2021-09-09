const slides = {
    thema: {
        title: 'Thema',
        slide: [
            'Ziel',
            'Aufteilung',
        ]
    },
    informationsgewinn: {
        title: 'Informationsgewinn',
        slide: [
            'Erkennen von Bewegung',
            'Kleinster umfassender Kreis',
            'Regressionsgeraden',
            'Optischer Fluss',
            'Lucas-Kanade'
        ]
    },
    momentanpol: {
        title: 'Momentanpol',
        slide: []
    },
    gruppierung: {
        title: 'Gruppierung',
        slide: [],
    },
    zusammenfassung: {
        title: 'Zusammenfassung',
        slide: [
            'Abbildungsverzeichnis'
        ]
    }
}

function addSlide(id) {
    const div = document.createElement('div');
    div.id = '' + id;
    div.className = 'slide';

    return div;
}

function createList(arr) {
    const ol = document.createElement('ol');
    arr.forEach((s) => {
        const li = document.createElement('li');
        li.innerHTML = s;
        ol.appendChild(li);
    });

    return ol;
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

    const ol = createList(sl.slide)

    sl.slide.forEach((_, i) => {
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

function setIframe(parent, src, height, pre = '../../src/') {
    const iframe = document.createElement('iframe');
    iframe.src = pre + src;
    iframe.style.height = '' + height + 'px';
    parent.appendChild(iframe);
}

function setImage(parent, src, text, width, pre = '../../gfx/') {
    const img = document.createElement('img');
    img.src = pre + src;
    img.width = width;
    parent.appendChild(img);

    const sub = document.createElement('h4');
    sub.innerHTML = text;

    parent.appendChild(sub);
}
