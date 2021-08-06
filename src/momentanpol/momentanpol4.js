const globalMomentanpolVariables = {
    data: new DataXY(),
    group: new Group({ lk: { maxCorners: 1 } }),
}

globalTestVariables.reset = function () {
    globalMomentanpolVariables.data.reset();
    globalMomentanpolVariables.group.reset();
}