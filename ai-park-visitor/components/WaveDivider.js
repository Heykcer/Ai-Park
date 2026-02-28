export default function WaveDivider({ color = "#fdfefe", className = "" }) {
    // SVG of a wavy border
    return (
        <div className={`w-full overflow-hidden leading-none ${className}`}>
            <svg
                className="relative block w-full h-[60px] md:h-[100px]"
                xmlns="http://www.w3.org/Dom/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <path
                    d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,130.83,123.82,197.6,110.8,241.26,102.24,282.88,80.64,321.39,56.44Z"
                    style={{ fill: color }}
                ></path>
            </svg>
        </div>
    );
}
