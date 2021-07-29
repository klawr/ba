
function removeOverlaps(boxes, dist = 5) {
    const mostAccurate = [];
    while (boxes.length) {
        const max = boxes.pop();
        mostAccurate.push(max);
        boxes = boxes.filter(
            (rec) =>
                Math.abs(rec.x - max.x) >= dist ||
                Math.abs(rec.y - max.y) >= dist
        );
    }
    return mostAccurate;
}
