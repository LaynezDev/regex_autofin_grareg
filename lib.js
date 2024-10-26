mermaid.initialize({ startOnLoad: true });
$("#btnGenerar").click(async function (e) {
    let txtExpReg = $("#txtExpresion").val();
    mermaid.initialize({ startOnLoad: false });

    // Example of using the render function
    const drawDiagram = async function (a) {
        element = document.querySelector('#mermaid');
        const graphDefinition = regexToMermaid(txtExpReg);
        const { svg } = await mermaid.render('mermaid', graphDefinition[0]);
        $('#divSVG').append(
            $("<div>")
                .attr("id", "mermaid")
                .addClass('col-sm-12')
                .html(svg)
        );
        return graphDefinition[1];
    };
    let texto = await drawDiagram();
    texto = texto.replace("S0","*")
    texto = texto.replaceAll("S","q")
    texto = texto.replace("*","S")
    texto = texto.replaceAll("\n","<br>")
    texto = texto.replaceAll("q0","S")
    $("#gramaticaRegular").html(texto)
    console.log(texto);
    //console.log(regexToMermaid(txtExpReg))
});

function renderMermaid(content) {
    mermaid.render('graphDiv', content, function (svgCode) {
        document.getElementById('mermaid').innerHTML = svgCode;
    });
}

function regexToMermaid(regex) {
    let diagramaMermaid = "graph TD;";
    let gramaticaRegular = "";
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
                if (estados[estados.length - 1] == undefined) {
                    diagramaMermaid = diagramaMermaid.replace("Start", "(Start)");
                    diagramaMermaid += `${state} -->|${exp[exp.indexOf(char) - 1]} 0 o más| ${state};`;
                    gramaticaRegular += `${state} -->${exp[exp.indexOf(char) - 1]} ${state}\n`;
                } else {
                    diagramaMermaid += `${state} -->|${exp[exp.indexOf(char) - 1]} 0 o más| ${estados[estados.length - 1]};`;
                    gramaticaRegular += `${state} -->${exp[exp.indexOf(char) - 1]} ${estados[estados.length - 1]}\n`;
                }
                //diagramaMermaid += `${estados[estados.length]} -->|0 o más| ${estados[estados.length - 1]};`;
            } else if (char === '|') {
                charOr = true;
            } else if (char == '+') {

                diagramaMermaid += `${state} -->| ${exp[exp.indexOf(char) - 1]} 0 o más| ${estados[estados.length - 1]};`;
                gramaticaRegular += `${state} --> ${exp[exp.indexOf(char) - 1]} ${estados[estados.length - 1]};`;
                if (ttlLetra == qtyLetra) {
                    diagramaMermaid = diagramaMermaid.replace(`q${ttlLetra - 1}`, `(q${ttlLetra - 1})`)
                    gramaticaRegular = diagramaMermaid.replace(`q${ttlLetra - 1}`, `(q${ttlLetra - 1})`)
                }

            } else if (char !== '(' && char !== ')') {
                if (exp[exp.indexOf(char) + 1] != '*') {
                    let nextState = crearEstado();
                    if (charOr == true) {
                        charOr = false
                        diagramaMermaid += `${oldState} --${char}--> ${nextState}((q${ttlLetra}));`;
                        gramaticaRegular += `${oldState} -->${char} ${nextState}\n`;
                    } else {
                        //let nextState = crearEstado();
                        if (ttlLetra == qtyLetra) {
                            diagramaMermaid += `${state} --${char}--> ${nextState}(((q${ttlLetra})));`;
                            gramaticaRegular += `${state} -->${char} ${nextState}\n`;
                        } else {
                            diagramaMermaid += `${state} --${char}--> ${nextState}((q${ttlLetra}));`;
                            gramaticaRegular += `${state} -->${char} ${nextState}\n`;

                        }
                    }
                    if (char == ")") {
                        oldState = state
                    }
                    estados.push(nextState);
                    state = nextState;
                } else {
                    //ttlLetra--
                }
            }
        }
        return estados;
    };

    const startState = crearEstado();
    diagramaMermaid += `${startState}((Start));`;
    //const endState = crearEstado();

    processRegex(regex, startState);
    //diagramaMermaid += `S${contadorEstado - 1} -->S${contadorEstado - 1}(((Fin)))`;

    return [diagramaMermaid,gramaticaRegular];
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


// $("#btnGenerar").click(async function (e) {
//     let txtExpReg = $("#txtExpresion").val();
   
// });

