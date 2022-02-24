const slides = [{
    title: 'IFTOMM-D-A-CH 2022',
    init: false,
    content(div) {
        const title = document.createElement('h1');
        title.innerHTML = 'Verfahren zur automatisierten Erkennung planarer Mechanismen in Videosequenzen';
        const name = document.createElement('h3');
        name.innerHTML = 'Stefan Gössner, Kai Lawrence';
        div.appendChild(title);
        div.appendChild(name);
    }
}, {
    title: 'Ziel',
    init: false,
    content(div) {
        const video = document.createElement('video');
        Object.assign(video, { src: '../gfx/werkzeugkoffer.MP4', autoplay: false, muted: true });

        const btn = document.createElement('button');
        btn.innerHTML = 'Start';
        btn.addEventListener('click', () => {
            video.pause();
            video.currentTime = 0;
            video.play();
        });

        div.appendChild(video);
        div.appendChild(document.createElement('br'));
        div.appendChild(btn);
    }
}, {
    title: 'Momentanpol',
    init: false,
    content(div) {
        const left = document.createElement('div');

        setImage(left, 'va.png', '1. Satz von Euler',
            document.body.clientWidth * 0.3, './gfx/');
        setImage(left, 'rap.png', 'Momentanpol',
            document.body.clientWidth * 0.4 / 1.6794, './gfx/');

        left.style.float = 'left';
        left.style.marginTop = '5%';

        const right = setImage(div,
            'mechanismentechnik_vektorfeld_momentanpol.png',
            'Vektorfeld der bewegung einer Ebene. [Gös16]',
            document.body.clientWidth * 0.3);
        right.style.float = 'right';
        right.style.marginTop = '5%';

        div.appendChild(left);
        div.appendChild(right);
    }
}, {
    title: 'Winkelgeschwindigkeit',
    init: false,
    content(div) { winkelgeschwindigkeit(div); }
}, {
    title: 'Geschwindigkeit eines Gliedpunktes',
    init: false,
    content(div) { geschwindigkeit(div) }
}, {
    title: 'Bestimmen des Pols',
    init: false,
    content(div) { pol(div) }
}, {
    title: 'Gruppieren von Gliedern',
    init: false,
    content(div) { group(div) }
}, {
    title: 'Das Viergelenk',
    init: false,
    content(div) { setIframe(div, './gruppe/gruppe4_1.html'); }
}, {
    init: false,
    title: 'Die Schubkurbel',
    content(div) { setIframe(div, './gruppe/gruppe4_2.html'); }
}, {
    title: 'Ausblick',
    init: false,
    content(div) {
        list(div, [
            'Ergebnisse vorallem abhängig von Genauigkeit der Gruppierung',
            'Methoden der künstlichen Intelligenz zur Verbesserung empfohlen',
            '"Echte" Bilder benötigen Bildbearbeitung']);

            setImage(div,
                'flownet_flying_chairs.png',
                'Optischer Fluss durch FlowNet [BBM09]',
                document.body.clientWidth * 0.4);
    }
}, {
    title: 'Abbildungsverzeichnis',
    init: false,
    content(div) {
        div.style.textAlign = 'left';
        bib(div, `[Gös16]: Stefan Gössner. Mechanismentechnik vektorielle Analyse ebener Mechanismen. Berlin: Logos Verlag Berlin GmbH, 2016`);

        bib(div, `[BBM09]: Thomas Brox, Christoph Bregler und Jitendra Malik. “Large displacement optical flow”. In: 2009 IEEE Conference on Computer Vision and Pattern Recognition. IEEE, Juni 2009`);
    }
}];

function createList(arr) {
    const ol = document.createElement('ol');
    arr.forEach((s) => {
        const li = document.createElement('li');
        li.innerHTML = s;
        ol.appendChild(li);
    });

    return ol;
}

function createSlide(slide) {
    const title = document.createElement('h1');
    title.innerHTML = slide.title;

    const div = document.createElement('div');
    div.id = slide.title.split(" ").join("");
    div.className = 'slide';
    const div2 = document.createElement('div');
    div2.className = 'slidecontent';

    if (!slide.init) {
        slide.content(div2);
    }

    div.appendChild(title);
    div.appendChild(document.createElement('hr'));
    div.appendChild(div2);
    document.getElementById('viewport').appendChild(div);

    return div;
}


function setIframe(parent, src, height, pre = '../src/') {
    const iframe = document.createElement('iframe');
    iframe.src = pre + src;
    parent.appendChild(iframe);
}

function setImage(parent, src, text, width, pre = '../gfx/', offset) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.src = pre + src;
    img.width = width;
    div.appendChild(img);

    const sub = document.createElement('h4');
    sub.innerHTML = text;

    div.appendChild(sub);
    div.style.marginTop = offset + 'px';
    parent.appendChild(div);

    return div;
}

function bib(parent, str) {
    const p = document.createElement('p');
    p.innerHTML = str;
    parent.appendChild(p);
}

function list(parent, args) {
    const ul = document.createElement('ul');
    ul.style.textAlign = 'left';

    for (const arg of args) {
        const li = document.createElement('li');
        li.innerHTML = arg;
        ul.appendChild(li);
    }

    parent.appendChild(ul);
}
