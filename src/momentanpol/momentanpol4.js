const globalMomentanpolVariables = {
    data: new DataXY(),
    group: new Group({ lk: true }),
}

globalTestVariables.reset = function () {
    globalMomentanpolVariables.data.reset();
    globalMomentanpolVariables.group.reset();
}