const btn1 = document.getElementById("btn_generar");
const arbol = document.getElementById("contenido_arbol");
const resultadoInorden = document.getElementById("resultado_inorden");
const resultadoPreorden = document.getElementById("resultado_preorden");
const resultadoPosorden = document.getElementById("resultado_posorden");


const estilos = {
    color: 'deepskyblue',
    outline: false,
    endPlugOutline: false,
    endPlugSize: 1,
    startPlug: 'behind',
    endPlug: 'behind'
};

let lineas = [];

function inorden(node) {
    if (!node) return "";
    if (!node.left && !node.right) {
        return node.value;
    }

    const left = inorden(node.left);
    const right = inorden(node.right);
    return `( ${left} ${node.value} ${right} )`;
}

function preorden(node) {
    if (!node) return "";
    const left = preorden(node.left);
    const right = preorden(node.right);
    return `${node.value} ${left} ${right}`.trim();
}

function posorden(node) {
    if (!node) return "";
    const left = posorden(node.left);
    const right = posorden(node.right);
    return `${left} ${right} ${node.value}`.trim();
}

function parseExpression(expresion) {
    expresion = expresion.replace(/\s+/g, '');
    if (expresion[0] === '(' && matchingParen(expresion, 0) === expresion.length - 1) {
        return parseExpression(expresion.slice(1, -1));
    }

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    let minPrecedence = Infinity;
    let pos = -1;
    let depth = 0;

    for (let i = expresion.length - 1; i >= 0; i--) {
        const char = expresion[i];
        if (char === ')') depth++;
        else if (char === '(') depth--;
        else if (precedence[char] && depth === 0) {
            if (precedence[char] <= minPrecedence) {
                minPrecedence = precedence[char];
                pos = i;
            }
        }
    }

    if (pos !== -1) {
        return {
            value: expresion[pos],
            left: parseExpression(expresion.slice(0, pos)),
            right: parseExpression(expresion.slice(pos + 1))
        };
    }
    
    return { value: expresion };
}

function matchingParen(expresion, start) {
    let count = 0;
    for (let i = start; i < expresion.length; i++) {
        if (expresion[i] === '(') count++;
        else if (expresion[i] === ')') count--;
        if (count === 0) return i;
    }
    return -1;
}

function renderTree(node, index = "root") {
    if (!node || !node.value) return '';

    const id = `node-${index}`;
    const operadores = ['+', '-', '*', '/'];
    const esOperando = !operadores.includes(node.value);

    const html = `
        <div class="tree-node text-center" 
             id="${id}" 
             style="
               position: relative;
               display: inline-block;
               margin: 20px;
             ">
            <button class="btn ${esOperando ? 'btn-success' : 'btn-primary'} rounded-circle" 
                    style="width: 50px; height: 50px; font-size: 1.2rem;">
                ${node.value}
            </button>
            <div class="tree-children d-flex justify-content-center" style="margin-top: 40px;">
                ${node.left ? renderTree(node.left, index + "L") : ''}
                ${node.right ? renderTree(node.right, index + "R") : ''}
            </div>
        </div>
    `;
    return html;
}

function conectarNodos(node, index = "root") {
    if (!node || (!node.left && !node.right)) return;

    const parentId = `node-${index}`;

    if (node.left && node.left.value) {
        const leftId = `node-${index}L`;
        const parent = document.getElementById(parentId).querySelector("button");
        const child = document.getElementById(leftId).querySelector("button");
        lineas.push(new LeaderLine(parent, child, estilos));
        conectarNodos(node.left, index + "L");
    }

    if (node.right && node.right.value) {
        const rightId = `node-${index}R`;
        const parent = document.getElementById(parentId).querySelector("button");
        const child = document.getElementById(rightId).querySelector("button");
        lineas.push(new LeaderLine(parent, child, estilos));
        conectarNodos(node.right, index + "R");
    }
}

btn1.addEventListener("click", function () {
    const expresion = document.getElementById("expresion").value;
    
    if (!/^[a-zA-Z0-9+\-*/() ]+$/.test(expresion) || expresion.trim() === "") {
        alert("Expresión no válida. Usa solo letras, números, +, -, *, / y paréntesis.");
        return;
    }
    
    lineas.forEach(l => l.remove());
    lineas = [];
    resultadoInorden.textContent = "";
    resultadoPreorden.textContent = "";
    resultadoPosorden.textContent = "";

    try {
        const tree = parseExpression(expresion);
        arbol.innerHTML = renderTree(tree);
    
        resultadoInorden.textContent = inorden(tree);
        resultadoPreorden.textContent = preorden(tree);
        resultadoPosorden.textContent = posorden(tree);
        
        setTimeout(() => conectarNodos(tree), 100);

    } catch (error) {
        alert("Error al parsear la expresión. Verifique que esté bien formada.");
        console.error(error);
    }
});