
const globalPendel2Variables = {
    nod: undefined,
    data: new DataXY(),
    lines: [],
}

globalTestVariables.reset = function() {
    globalPendel2Variables.data.reset();
    globalPendel2Variables.lines = [];
}
