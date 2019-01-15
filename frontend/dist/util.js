/**
 * Returns val clamped between min and max
 * @param val Value to clamp
 * @param min Lowest return value
 * @param max Highest return value
 */
export function clamp(val, min, max) {
    return Math.min(max, Math.max(val, min));
}
/**
 * Returns true if val is greater than or equal to min, and less than max
 * @param val Value to check bounds on
 * @param min Lower inclusive bound
 * @param max Upper Bound
 */
export function boundedBy(val, min, max) {
    // include lower bound exclude upper bound
    return val >= min && val < max;
}
/**
 * Returns a hex string based on an HSL colour
 * @param h Hue in degrees
 * @param s Saturation percent
 * @param l Luminance percent
 */
export function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    }
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
export function generateID(length = 4) {
    let str = "";
    for (let i = 0; i < length; i++) {
        str += Math.random().toString(36).substr(2);
    }
    return str.substr(0, length).toUpperCase();
}
