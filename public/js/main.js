const btn1 = document.getElementById("btn_generar");
const arbol = document.getElementById("contenido_arbol");

const estilos = {
    color: '#00f2ff',
    outline: false,
    endPlugOutline: false,
    endPlugSize: 1,
    startPlug: 'behind',
    endPlug: 'behind'
};

let lineas = [];

function parseExpression(expresion) {
    expresion = expresion.replace(/\s+/g, '');
    if (expresion[0] === '(' && matchingParen(expresion, 0) === expresion.length - 1) {
        return parseExpression(expresion.slice(1, -1));
    }

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    let minPrecedence = Infinity;
    let pos = -1;
    let depth = 0;

    for (let i = 0; i < expresion.length; i++) {
        const char = expresion[i];
        if (char === '(') depth++;
        else if (char === ')') depth--;
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

function renderTree(node, level = 0, index = "root") {
    if (!node) return '';

    const id = `node-${index}`;
    const html = `
        <div class="tree-node text-center" 
             id="${id}" 
             style="
                position: relative;
                display: inline-block;
                margin: 20px;
             ">
            <button class="btn ${isNaN(node.value) ? 'btn-primary' : 'btn-success'} rounded-circle" 
                    style="width: 50px; height: 50px;">
                ${node.value}
            </button>
            <div class="tree-children d-flex justify-content-center" style="margin-top: 40px;">
                ${node.left ? renderTree(node.left, level + 1, index + "L") : ''}
                ${node.right ? renderTree(node.right, level + 1, index + "R") : ''}
            </div>
        </div>
    `;
    return html;
}

function conectarNodos(node, index = "root") {
    if (!node || (!node.left && !node.right)) return;

    const parentId = `node-${index}`;

    if (node.left) {
        const leftId = `node-${index}L`;
        const parent = document.getElementById(parentId).querySelector("button");
        const child = document.getElementById(leftId).querySelector("button");
        lineas.push(new LeaderLine(parent, child, estilos));
        conectarNodos(node.left, index + "L");
    }

    if (node.right) {
        const rightId = `node-${index}R`;
        const parent = document.getElementById(parentId).querySelector("button");
        const child = document.getElementById(rightId).querySelector("button");
        lineas.push(new LeaderLine(parent, child, estilos));
        conectarNodos(node.right, index + "R");
    }
}

btn1.addEventListener("click", function () {
    const expresion = document.getElementById("expresion").value;
    if (!/^[0-9+\-*/() ]+$/.test(expresion)) {
        alert("Expresión no válida. Usa solo números, +, -, *, / y paréntesis.");
        return;
    }
    lineas.forEach(l => l.remove());
    lineas = [];
    const tree = parseExpression(expresion);
    arbol.innerHTML = renderTree(tree);
    setTimeout(() => conectarNodos(tree), 200);
});
