/**
 * Estrategia tendencial simple (moving average crossover)
 * Ideal para probar Monte Carlo y calibrar robustez.
 */
export const trendStrategy = {
    name: "Tendencial Simple",
    onBar(bar, i, position, context) {
        // Usa un pequeño buffer de contexto para promedios
        const closes = context?.closes ?? [];
        closes.push(bar.c);
        if (closes.length > 50)
            closes.shift(); // solo mantenemos últimas 50
        // Si no hay suficientes datos, no operamos
        if (closes.length < 30)
            return null;
        const shortMA = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
        const longMA = closes.slice(-30).reduce((a, b) => a + b, 0) / 30;
        // Señales: cruce de medias
        if (shortMA > longMA && !position)
            return "buy";
        if (shortMA < longMA && position)
            return "sell";
        return null;
    },
};
