
function removeOverlaps(boxes) {
    const mostAccurate = [];
    while (boxes.length) {
        const max = boxes.pop();
        mostAccurate.push(max);
        boxes = boxes.filter(
            (rec) =>
                Math.abs(rec.x - max.x) >= 10 ||
                Math.abs(rec.y - max.y) >= 10
        );
    }
    return mostAccurate;
}
