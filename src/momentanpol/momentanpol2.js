const globalMomentanpol2Variables = {
    data: new DataXY(),
    group: new Group({ lk: { maxCorners: 1 } }),
}

globalTestVariables.reset = function () {
    globalMomentanpol2Variables.group.reset();
    globalMomentanpol2Variables.data.reset();
}