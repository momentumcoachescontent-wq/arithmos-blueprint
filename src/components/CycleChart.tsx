import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

const MONTHS_ES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function reduceToSingleDigitOrMaster(num: number): number {
    const masters = [11, 22, 33];
    let current = num;
    while (current > 9 && !masters.includes(current)) {
        const digits = current.toString().split("").map(Number);
        current = digits.reduce((a, b) => a + b, 0);
    }
    return current;
}

function calculatePersonalYear(birthDate: string, year: number): number {
    const [, month, day] = birthDate.split("-").map(Number);
    const raw = day + month + year;
    return reduceToSingleDigitOrMaster(raw);
}

function calculatePersonalMonth(birthDate: string, year: number, month: number): number {
    const personalYear = calculatePersonalYear(birthDate, year);
    return reduceToSingleDigitOrMaster(personalYear + month);
}

interface CycleChartProps {
    birthDate: string;
}

const POWER_NUMBERS = [1, 8, 11, 22, 33];
const HIGH_MONTHS = [1, 3, 5, 8, 11];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const isPower = POWER_NUMBERS.includes(value);
        return (
            <div className="bg-background border border-border rounded-lg px-4 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground font-sans mb-1">{label}</p>
                <p className={`text-lg font-serif font-bold ${isPower ? "text-primary" : "text-foreground"}`}>
                    {value}
                    {isPower && <span className="text-xs ml-1 text-primary">✦ Poder</span>}
                </p>
            </div>
        );
    }
    return null;
};

export function CycleChart({ birthDate }: CycleChartProps) {
    const year = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const data = MONTHS_ES.map((name, idx) => ({
        name,
        numero: calculatePersonalMonth(birthDate, year, idx + 1),
        esMesActual: idx + 1 === currentMonth,
        esAlto: HIGH_MONTHS.includes(calculatePersonalMonth(birthDate, year, idx + 1)),
    }));

    const personalYear = calculatePersonalYear(birthDate, year);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-sans tracking-widest text-muted-foreground uppercase">
                    Ciclos Personales · {year}
                </h3>
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                    <span className="text-xs text-muted-foreground font-sans">Año Personal:</span>
                    <span className="text-sm font-serif font-bold text-primary">{personalYear}</span>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="cycleGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="name"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "sans-serif" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[1, 11]}
                            ticks={[1, 3, 5, 7, 9, 11]}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontFamily: "sans-serif" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine
                            x={MONTHS_ES[currentMonth - 1]}
                            stroke="hsl(var(--primary))"
                            strokeDasharray="3 3"
                            strokeOpacity={0.6}
                        />
                        <Area
                            type="monotone"
                            dataKey="numero"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#cycleGradient)"
                            dot={(props) => {
                                const { cx, cy, payload } = props;
                                const isPower = POWER_NUMBERS.includes(payload.numero);
                                return (
                                    <circle
                                        key={`dot-${payload.name}`}
                                        cx={cx}
                                        cy={cy}
                                        r={isPower ? 5 : 3}
                                        fill={isPower ? "hsl(var(--primary))" : "hsl(var(--background))"}
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                    />
                                );
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <p className="text-xs text-center text-muted-foreground font-sans mt-2">
                    ✦ Los puntos destacados indican meses de mayor potencial estratégico
                </p>
            </div>
        </motion.div>
    );
}
