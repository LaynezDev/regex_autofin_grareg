
mermaid.initialize({ startOnLoad: true });
$("#btnGenerar").click(async function (e) {
    let txtExpReg = $("#txtExpresion").val();
    mermaid.initialize({ startOnLoad: false });

    // Example of using the render function
    const drawDiagram = async function () {
        element = document.querySelector('#mermaid');
        const graphDefinition = regexToMermaid(txtExpReg);
        const { svg } = await mermaid.render('mermaid', graphDefinition);
        $('#divSVG').append(
            $("<div>")
                .attr("id", "mermaid")
                .addClass('col-sm-12')
                .html(svg)
        );
    };

    await drawDiagram();

    console.log(regexToMermaid(txtExpReg))
});

function renderMermaid(content) {
    mermaid.render('graphDiv', content, function (svgCode) {
        document.getElementById('mermaid').innerHTML = svgCode;
    });
}

function regexToMermaid(regex) {
    let diagramaMermaid = "graph TD;";
    let contadorEstado = 0;

    const crearEstado = () => `S${contadorEstado++}`;

    const processRegex = (exp, state) => {
        if (exp instanceof RegExp) {
            exp = exp.source;
        }

        const estados = [];
        let qtyLetra = exp.length;
        let ttlLetra = 0;
        let oldState = state;
        let charOr = false;
        for (let char of exp) {
            ttlLetra++;
            if (char === '*') {
                diagramaMermaid += `${state} -->|0 o más| ${estados[estados.length - 1]};`;
            } else if (char === '|') {
                charOr = true;
                //let altState = crearEstado();

                //estados.push(altState);
            } else if (char !== '(' && char !== ')') {
                let nextState = crearEstado();
                if (charOr == true) {
                    charOr = false
                    diagramaMermaid += `${oldState} --${char}--> ${nextState}((q${ttlLetra}));`;
                } else {
                    //let nextState = crearEstado();
                    if (ttlLetra == qtyLetra) {
                        diagramaMermaid += `${state} --${char}--> ${nextState}(((q${ttlLetra})));`;
                    } else {
                        diagramaMermaid += `${state} --${char}--> ${nextState}((q${ttlLetra}));`;
                    }
                }
                oldState = state
                estados.push(nextState);
                state = nextState;
            }
        }

        return estados;
    };

    const startState = crearEstado();
    diagramaMermaid += `${startState}((Start));`;
    //const endState = crearEstado();

    processRegex(regex, startState);
    //diagramaMermaid += `S${contadorEstado - 1} -->S${contadorEstado - 1}(((Fin)))`;

    return diagramaMermaid;
}

$("#btnGuardarSVG").click(function () {
    const svgContainer = document.getElementById('mermaid');
    const svg = svgContainer.innerHTML;

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

})


$("#btnGenerar").click(async function (e) {
    let txtExpReg = $("#txtExpresion").val();
    console.log(regexToMermaid(txtExpReg))
});

