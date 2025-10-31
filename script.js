// Initialize variables
let memory = 0;
let isDegrees = true;
let lastResult = 0;
const display = document.getElementById('display');
const secondaryDisplay = document.getElementById('secondaryDisplay');
const historyList = document.getElementById('historyList');

// Load theme preference
document.body.classList.toggle('dark', localStorage.getItem('darkMode') === 'true');
updateThemeIcon();

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Angle mode toggle
    document.querySelectorAll('input[name="angleMode"]').forEach(input => {
        input.addEventListener('change', (e) => {
            isDegrees = e.target.value === 'deg';
            calculate(); // Recalculate with new angle mode
        });
    });

    // Theme toggle button
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
});

// Handle keyboard input
function handleKeyPress(e) {
    e.preventDefault();
    const key = e.key.toLowerCase();

    if (/[0-9]/.test(key)) {
        appendValue(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
        appendValue(key);
    } else if (key === 'enter' || key === '=') {
        calculate();
    } else if (key === 'escape') {
        clearDisplay();
    } else if (key === 'backspace') {
        backspace();
    } else if (key === '.') {
        addDecimal();
    } else if (key === 'p') {
        appendValue('pi');
    } else if (key === 'e') {
        appendValue('e');
    }
}

// Display functions
function appendValue(value) {
    display.value += value;
    updateSecondaryDisplay();
}

function clearDisplay() {
    display.value = '';
    secondaryDisplay.textContent = '';
}

function backspace() {
    display.value = display.value.slice(0, -1);
    updateSecondaryDisplay();
}

function addDecimal() {
    const parts = display.value.split(/[\+\-\*\/]/);
    const lastNumber = parts[parts.length - 1];
    if (!lastNumber.includes('.')) {
        display.value += '.';
    }
}

function updateSecondaryDisplay() {
    try {
        const result = evaluateExpression(display.value);
        secondaryDisplay.textContent = result !== undefined ? `= ${result}` : '';
    } catch {
        secondaryDisplay.textContent = '';
    }
}

// Math functions
function appendSquare() {
    if (display.value) {
        const currentValue = display.value;
        calculate(); // Calculate any pending expression first
        const value = display.value || currentValue;
        display.value = `pow(${value}, 2)`;
        calculate();
    }
}

function appendCube() {
    if (display.value) {
        const currentValue = display.value;
        calculate(); // Calculate any pending expression first
        const value = display.value || currentValue;
        display.value = `pow(${value}, 3)`;
        calculate();
    }
}

function appendPower() {
    if (display.value) {
        const currentValue = display.value;
        calculate(); // Calculate any pending expression first
        const value = display.value || currentValue;
        display.value = `(${value})**`;  // Using ** for power operation
    }
}

function invertNumber() {
    if (display.value !== '') {
        calculate();
        display.value = -parseFloat(display.value);
    }
}

// Scientific functions
function evaluateExpression(expression) {
    if (!expression) return undefined;
    
    // Remove any trailing operators
    expression = expression.replace(/[\+\-\*\/\^]$/, '');

    try {
    // Handle special functions
    expression = expression.replace(/rand\(\)/g, 'random()');
    
    // Handle power operations - using math.js pow function
    expression = expression.replace(/\^/g, '**');  // Convert ^ to **
    expression = expression.replace(/(\-?\d+\.?\d*)\*\*(\-?\d+\.?\d*)/g, 'pow($1, $2)');  // Convert a**b to pow(a,b)
    expression = expression.replace(/\((.*?)\)\*\*(\-?\d+\.?\d*)/g, 'pow($1, $2)');  // Convert (expression)**b to pow(expression,b)        // Add implementation for sec, csc, cot
        expression = expression.replace(/sec\((.*?)\)/g, '1/cos($1)');
        expression = expression.replace(/csc\((.*?)\)/g, '1/sin($1)');
        expression = expression.replace(/cot\((.*?)\)/g, '1/tan($1)');

        // Convert degrees to radians for trigonometric functions
        if (isDegrees) {
            expression = expression.replace(/sin\((.*?)\)/g, 'sin($1 * pi/180)');
            expression = expression.replace(/cos\((.*?)\)/g, 'cos($1 * pi/180)');
            expression = expression.replace(/tan\((.*?)\)/g, 'tan($1 * pi/180)');
            expression = expression.replace(/asin\((.*?)\)/g, 'asin($1) * 180/pi');
            expression = expression.replace(/acos\((.*?)\)/g, 'acos($1) * 180/pi');
            expression = expression.replace(/atan\((.*?)\)/g, 'atan($1) * 180/pi');
        }

        // Handle factorials
        expression = expression.replace(/(\d+)!/g, 'factorial($1)');

        const result = math.evaluate(expression);
        return typeof result === 'number' ? Number(result.toPrecision(10)) : result;
    } catch (error) {
        console.error('Expression evaluation error:', error);
        return undefined;
    }
}

function calculate() {
    try {
        const expression = display.value;
        const result = evaluateExpression(expression);
        
        if (result !== undefined) {
            addToHistory(expression, result);
            display.value = result;
            lastResult = result;
            secondaryDisplay.textContent = '';
        } else {
            display.value = 'Error';
            setTimeout(clearDisplay, 2000);
        }
    } catch (error) {
        console.error(error);
        display.value = 'Error';
        setTimeout(clearDisplay, 2000);
    }
}

// Memory functions
function memoryClear() {
    memory = 0;
}

function memoryRecall() {
    display.value += memory;
    updateSecondaryDisplay();
}

function memoryAdd() {
    try {
        calculate();
        memory += parseFloat(display.value) || 0;
    } catch {
        // Handle error silently
    }
}

function memorySubtract() {
    try {
        calculate();
        memory -= parseFloat(display.value) || 0;
    } catch {
        // Handle error silently
    }
}

// History functions
function addToHistory(expression, result) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `${expression} = ${result}`;
    historyItem.onclick = () => {
        display.value = result;
        updateSecondaryDisplay();
    };
    historyList.insertBefore(historyItem, historyList.firstChild);
}

function clearHistory() {
    historyList.innerHTML = '';
}

// Theme functions
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    
    // Also toggle classes for calculator and history panel
    const calculator = document.querySelector('.calculator');
    const historyPanel = document.querySelector('.history-panel');
    if (calculator) calculator.classList.toggle('dark');
    if (historyPanel) historyPanel.classList.toggle('dark');
}
