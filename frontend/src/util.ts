/**
 * Returns val clamped between min and max
 * @param val Value to clamp
 * @param min Lowest return value
 * @param max Highest return value
 */
export function clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(val, min));
}
/**
 * Returns true if val is greater than or equal to min, and less than max
 * @param val Value to check bounds on
 * @param min Lower inclusive bound
 * @param max Upper Bound
 */
export function boundedBy(val: number, min: number, max: number): boolean {
    // include lower bound exclude upper bound
    return val >= min && val < max;
}

/**
 * Returns a hex string based on an HSL colour
 * @param h Hue in degrees
 * @param s Saturation percent
 * @param l Luminance percent
 */
export function hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;
    let r: number, g: number, b: number;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb: ((p: number, q: number, t: number) => number) = (
            p: number,
            q: number,
            t: number
        ) => {
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
        const q: number = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p: number = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex: (x: number) => string = (x: number) => {
        const hex: string = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateID(length: number = 4): string {
    let str: string = "";
    for ( let i: number = 0; i < length; i++ ) {
        str += Math.random().toString(36).substr(2);
    }
    return str.substr(0, length).toUpperCase();
}


export class Colour {
    r: number;
    g: number;
    b: number;
    constructor(r: number = 0, g: number = 0, b: number = 0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static fromHex(hexString: string): Colour {
        console.log(hexString);
        hexString = hexString.substr(1);
        let r: number = hexToNumber(hexString.substr(0, 2));
        let g: number = hexToNumber(hexString.substr(2, 2));
        let b: number = hexToNumber(hexString.substr(4, 2));
        console.log(r, g, b);
        console.log(new Colour(r, g, b).hex());
        return new Colour(r, g, b);
    }

    copy(): Colour {
        return new Colour(this.r, this.g, this.b);
    }

    hex(): string {
        return `#${numberToHex(this.r)}${numberToHex(this.g)}${numberToHex(this.b)}`;
    }

    get luminosity(): number {
        return (this.r + this.g + this.b) / 3;
    }

    set luminosity(targetLuminosity: number) {
        let currentLuminosity: number = this.luminosity;
        let luminosityRatio: number = currentLuminosity / targetLuminosity;
        this.r *= luminosityRatio;
        this.g *= luminosityRatio;
        this.b *= luminosityRatio;
    }

    toString(): string {
        return this.hex();
    }
}

function numberToHex(num: number): string {
    let val: number = Math.floor(Math.min(num, 255));
    return val.toString(16);
}
function hexToNumber(hex: string): number {
    return parseInt(hex, 16);
}