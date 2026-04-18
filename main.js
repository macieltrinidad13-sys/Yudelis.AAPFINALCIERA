/**
 * main.js - Versión Académica Directa
 * Objetivo: Gestión de divisas en tiempo real vs DOP
 * Estudiante: Yudelis Trinidad
 */

// 1. CONFIGURACIÓN INICIAL
const API_KEY = "be4c3e19e070e2ec67cea77f"; // Tu Key de ExchangeRate-API
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/DOP`;

// Listado de las 12 monedas más relevantes
const currencies = [
    { code: 'USD', name: 'Dólar Estadounidense', flag: 'us', color: 'blue' },
    { code: 'EUR', name: 'Euro (Unión Europea)', flag: 'eu', color: 'purple' },
    { code: 'GBP', name: 'Libra Esterlina', flag: 'gb', color: 'green' },
    { code: 'CAD', name: 'Dólar Canadiense', flag: 'ca', color: 'blue' },
    { code: 'JPY', name: 'Yen Japonés', flag: 'jp', color: 'purple' },
    { code: 'CHF', name: 'Franco Suizo', flag: 'ch', color: 'green' },
    { code: 'CNY', name: 'Yuan Chino', flag: 'cn', color: 'blue' },
    { code: 'BRL', name: 'Real Brasileño', flag: 'br', color: 'purple' },
    { code: 'MXN', name: 'Peso Mexicano', flag: 'mx', color: 'green' },
    { code: 'ARS', name: 'Peso Argentino', flag: 'ar', color: 'blue' },
    { code: 'COP', name: 'Peso Colombiano', flag: 'co', color: 'purple' },
    { code: 'CLP', name: 'Peso Chileno', flag: 'cl', color: 'green' }
];

let globalRates = {}; // Almacén para los datos de la API

// 2. FUNCIÓN DE INICIO
async function initApp() {
    console.log("Iniciando conexión con ExchangeRate-API...");
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        
        if (data.result === "success") {
            globalRates = data.conversion_rates;
            renderCurrencyCards();
            setupCalculator();
        } else {
            alert("Error en la API Key o límite alcanzado.");
        }
    } catch (error) {
        console.error("Fallo de red:", error);
        document.getElementById('currencyGrid').innerHTML = 
            `<h2 class="text-danger w-100 text-center">Error al conectar con el servidor financiero.</h2>`;
    }
}

// 3. RENDERIZADO DE TARJETAS (ESTILO CYBERPUNK)
function renderCurrencyCards() {
    const container = document.getElementById('currencyGrid');
    container.innerHTML = ''; // Limpiar contenedor

    currencies.forEach(cur => {
        // La API devuelve cuánto vale 1 DOP en la moneda X. 
        // Para saber cuánto cuesta la moneda X en RD$, invertimos: 1 / tasa.
        const rateAgainstDOP = (1 / globalRates[cur.code]).toFixed(2);
        
        const cardHTML = `
            <div class="col">
                <div class="currency-card h-100 ${cur.color}">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div class="d-flex align-items-center">
                            <img src="https://flagcdn.com/w80/${cur.flag}.png" class="flag-icon me-3" alt="${cur.code}">
                            <div>
                                <h6 class="m-0 text-secondary">${cur.code}</h6>
                                <p class="m-0 small text-uppercase" style="font-size: 10px;">${cur.name}</p>
                            </div>
                        </div>
                        <i class="fa-solid fa-chart-line text-neon-${cur.color}"></i>
                    </div>
                    
                    <div class="rate-box my-3">
                        <span class="text-secondary small">VALOR ACTUAL:</span>
                        <h2 class="rate-display text-white fw-bold" id="val-${cur.code}">
                            RD$ ${rateAgainstDOP}
                        </h2>
                    </div>

                    <div id="chart-${cur.code}" class="apex-chart-container"></div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
        createTrendChart(cur.code, cur.color);
    });
}

// 4. GENERACIÓN DE GRÁFICOS (APEXCHARTS)
function createTrendChart(code, color) {
    const colorsMap = {
        'blue': '#00d2ff',
        'purple': '#9d00ff',
        'green': '#39ff14'
    };

    const options = {
        series: [{
            name: 'Tendencia',
            // Generamos datos aleatorios simulando los últimos 6 meses
            data: Array.from({length: 6}, () => Math.floor(Math.random() * (65 - 55 + 1)) + 55)
        }],
        chart: {
            type: 'area',
            height: 80,
            sparklines: { enabled: true },
            animations: { enabled: true, easing: 'easeinout', speed: 800 }
        },
        stroke: { curve: 'smooth', width: 2 },
        colors: [colorsMap[color]],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 90, 100]
            }
        },
        tooltip: { theme: 'dark', x: { show: false } }
    };

    const chart = new ApexCharts(document.querySelector(`#chart-${code}`), options);
    chart.render();
}

// 5. CALCULADOR MAESTRO (Lógica interactiva)
function setupCalculator() {
    const input = document.getElementById('baseAmount');
    
    input.addEventListener('input', (e) => {
        const amountDOP = e.target.value;

        currencies.forEach(cur => {
            const display = document.getElementById(`val-${cur.code}`);
            if (amountDOP > 0) {
                // Cálculo: Monto en DOP * (1 moneda extranjera / su valor en DOP)
                const converted = (amountDOP / globalRates[cur.code]).toFixed(2);
                display.innerText = `${cur.code} ${converted}`;
                display.classList.add('text-neon-green'); // Efecto visual al calcular
            } else {
                const originalRate = (1 / globalRates[cur.code]).toFixed(2);
                display.innerText = `RD$ ${originalRate}`;
                display.classList.remove('text-neon-green');
            }
        });
    });
}

// Ejecutar al cargar la página
window.onload = initApp;
