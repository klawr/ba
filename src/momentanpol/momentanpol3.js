const globalMomentanpol6Variables = {
    data: new DataXY(),
    group: new Group({ lk: { maxCorners: 1 } }),
}

globalTestVariables.reset = function () {
    globalMomentanpol6Variables.data.reset();
    globalMomentanpol6Variables.group.reset();
}