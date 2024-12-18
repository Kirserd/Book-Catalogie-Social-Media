
// VARIABLES -------------------------------------------------------------------------------------

const vanilla_dark = {
  c1: '#070707', 
  c2: '#8b8b8b',
  a: '#916d4c' 
} 

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
  
  // Function to darken a color by a given percentage (0-100)
  function darkenColor(color, percent) {
    const factor = (100 - percent) / 100; // Convert percent to factor
    const r = Math.round(parseInt(color.slice(1, 3), 16) * factor);
    const g = Math.round(parseInt(color.slice(3, 5), 16) * factor);
    const b = Math.round(parseInt(color.slice(5, 7), 16) * factor);
  
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // Function to generate the theme based on lightness percentages
  function generateTheme(color1, color2, accent) {
    const colors = {
      '--s-0': { color: '#070707', lightness: 0 },
      '--s-1': { color: '#0f0f0f', lightness: 5.77 },
      '--s-2': { color: '#111111', lightness: 7.69 },
  
      '--b-0': { color: '#111111', lightness: 7.69 },
      '--b-1': { color: '#181818', lightness: 13.46 },
      '--b-2': { color: '#1e1e1e', lightness: 17.3 },
      '--b-3': { color: '#212121', lightness: 19.23 },
      '--b-4': { color: '#282828', lightness: 25 },
  
      '--b-0h': { color: '#1e1e1e', lightness: 17.3 },
      '--b-1h': { color: '#212121', lightness: 19.23 },
      '--b-2h': { color: '#282828', lightness: 25 },
      '--b-3h': { color: '#313131', lightness: 32.69 },
      '--b-4h': { color: '#393939', lightness: 38.46 },
  
      '--o-0': { color: '#313131', lightness: 32.69 },
      '--o-1': { color: '#393939', lightness: 38.46 },
      '--o-1': { color: '#444444', lightness: 43.32 },
  
      '--a-0': { color: '#916d4c', lightness: 103.84 },
      '--a-0a': { color: '#7a5c3f', lightness: 86.54 },
  
      '--t-0': { color: '#cecece', lightness: 111.54 }, 
      '--t-1': { color: '#8b8b8b', lightness: 100 },
      '--t-2': { color: '#727272', lightness: 80.77 },
      '--t-3': { color: '#555', lightness: 59.6 },
    };
  
    const accentLightness = 105; 
    const darkerAccentLightness = 85; 
    const accentDarkFactor = 1 - darkerAccentLightness / accentLightness;
    const accentDark = darkenColor(accent, accentDarkFactor * 100);
  
    let theme = `/* Generated Theme based on ${color1} and ${color2} */\n\n:root {\n`;
    for (const key in colors) {
      if (colors.hasOwnProperty(key)) {
        const colorObj = colors[key];
        const lightnessFactor = colorObj.lightness / 100;
        theme += `  ${key}: ${interpolateColor(color1, color2, lightnessFactor)};\n`;
      }
    } 
    theme += `  --a-0: ${accent};\n`;
    theme += `  --a-0a: ${accentDark};\n`;
    theme += `}\n`;
  
    const styleTag = document.createElement('style');
    styleTag.innerHTML = theme;
    document.head.appendChild(styleTag);
  }

  
  generateTheme(vanilla_dark.c1, vanilla_dark.c2, vanilla_dark.a);
 // generateTheme('#1E0004', '#A37F37', '#D0C46C');