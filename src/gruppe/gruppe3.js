const globalGruppe3Variables = {
    lk: new OpenCVLucasKanade(),
}

globalTestVariables.reset = function () {
    globalGruppe3Variables.lk.init();
}