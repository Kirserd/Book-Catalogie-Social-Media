
// VARIABLES -------------------------------------------------------------------------------------

let currentThemeStyle = document.createElement('style');

const vanilla_dark = {
  c1: '#070707', 
  c2: '#8b8b8b',
  a: '#916d4c', 
  contrast: 20,
  moreAccents: 0
} 

const lowContrast = {
  "--s-0": 4.0,
  "--s-1": 6.92,
  "--s-2": 9.23,
  "--b-0": 9.23,
  "--b-1": 16.15,
  "--b-2": 20.76,
  "--b-3": 23.08,
  "--b-4": 30.0,
  "--b-0h": 20.76,
  "--b-1h": 23.08,
  "--b-2h": 30.0,
  "--b-3h": 39.23,
  "--b-4h": 46.15,
  "--o-0": 39.23,
  "--o-1": 46.15,
  "--o-2": 51.98,
  "--a-0": 100.61,
  "--a-0a": 79.85,
  "--t-0": 109.85,
  "--t-1": 96.0,
  "--t-2": 72.92,
  "--t-3": 47.52
}
const highContrast = {
  "--s-0": 0,
  "--s-1": 0.25,
  "--s-2": 0.5,
  "--b-0": 0,
  "--b-1": 1,
  "--b-2": 2,
  "--b-3": 3,
  "--b-4": 4,
  "--b-0h": 2,
  "--b-1h": 3,
  "--b-2h": 4,
  "--b-3h": 5,
  "--b-4h": 6,
  "--o-0": 30,
  "--o-1": 50,
  "--o-2": 70,
  "--a-0": 100,
  "--a-0a": 80,
  "--t-0": 100,
  "--t-1": 100,
  "--t-2": 90,
  "--t-3": 80
};

// FUNCTIONS -------------------------------------------------------------------------------------

function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
  
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
  
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
  
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
  
function darkenColor(color, percent) {
  const factor = (100 - percent) / 100; // Convert percent to factor
  const r = Math.round(parseInt(color.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(color.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(color.slice(5, 7), 16) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
  
export function setTheme(color1, color2, accent, contrast, moreAccents) {
  
  contrast = contrast * 0.01;

  function lerp(a, b, t) {
    return a + t * (b - a);
  }

  const colors = {
    '--s-0': lerp(lowContrast['--s-0'], highContrast['--s-0'], contrast),
    '--s-1': lerp(lowContrast['--s-1'], highContrast['--s-1'], contrast),
    '--s-2': lerp(lowContrast['--s-2'], highContrast['--s-2'], contrast),
    '--b-0': lerp(lowContrast['--b-0'], highContrast['--b-0'], contrast),
    '--b-1': lerp(lowContrast['--b-1'], highContrast['--b-1'], contrast),
    '--b-2': lerp(lowContrast['--b-2'], highContrast['--b-2'], contrast),
    '--b-3': lerp(lowContrast['--b-3'], highContrast['--b-3'], contrast),
    '--b-4': lerp(lowContrast['--b-4'], highContrast['--b-4'], contrast),
    '--b-0h': lerp(lowContrast['--b-0h'], highContrast['--b-0h'], contrast),
    '--b-1h': lerp(lowContrast['--b-1h'], highContrast['--b-1h'], contrast),
    '--b-2h': lerp(lowContrast['--b-2h'], highContrast['--b-2h'], contrast),
    '--b-3h': lerp(lowContrast['--b-3h'], highContrast['--b-3h'], contrast),
    '--b-4h': lerp(lowContrast['--b-4h'], highContrast['--b-4h'], contrast),
    '--o-0': lerp(lowContrast['--o-0'], highContrast['--o-0'], contrast),
    '--o-1': lerp(lowContrast['--o-1'], highContrast['--o-1'], contrast),
    '--o-2': lerp(lowContrast['--o-2'], highContrast['--o-2'], contrast),
    '--a-0': lerp(lowContrast['--a-0'], highContrast['--a-0'], contrast),
    '--a-0a': lerp(lowContrast['--a-0a'], highContrast['--a-0a'], contrast),
    '--t-0': lerp(lowContrast['--t-0'], highContrast['--t-0'], contrast),
    '--t-1': lerp(lowContrast['--t-1'], highContrast['--t-1'], contrast),
    '--t-2': lerp(lowContrast['--t-2'], highContrast['--t-2'], contrast),
    '--t-3': lerp(lowContrast['--t-3'], highContrast['--t-3'], contrast),
};

  const accentLightness = 105; 
  const darkerAccentLightness = 85; 
  const accentDarkFactor = 1 - darkerAccentLightness / accentLightness;
  const accentDark = darkenColor(accent, accentDarkFactor * 100);

  let theme = `/* Generated Theme based on ${color1} and ${color2} */\n\n:root {\n`;
  for (const key in colors) {
    if (colors.hasOwnProperty(key)) {
      const colorObj = colors[key];
      const lightnessFactor = colorObj / 100;
      theme += `  ${key}: ${interpolateColor(color1, color2, lightnessFactor)};\n`;
    }
  } 
  theme += `  --a-0: ${accent};\n`;
  theme += `  --a-0a: ${accentDark};\n`;
  theme += `}\n`;

  currentThemeStyle.innerHTML = theme;
}

document.head.appendChild(currentThemeStyle);
setTheme(vanilla_dark.c1, vanilla_dark.c2, vanilla_dark.a, 20, 0);