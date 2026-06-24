const fs = require('fs');
let xp = fs.readFileSync('src/app/seed-wizard/components/SeedWizardXP.tsx', 'utf-8');

// Replace component name
let darkside = xp.replace('export default function SeedWizardXP', 'export default function SeedWizardDarkside');
let glass = xp.replace('export default function SeedWizardXP', 'export default function SeedWizardGlass');

// For Darkside
darkside = darkside
  // Change background and borders
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'var(--app-bg)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'var(--app-window-bg)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid var(--app-border)', borderRadius: '8px'")
  .replace(/borderBottom: '1px solid var\(--app-border\)'/g, "borderBottom: '1px solid var(--app-border)'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--app-border)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'var(--app-panel)', color: 'var(--app-text)', padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--app-border)' }}")
  // Replace buttons
  .replace(/className="btn"/g, "className=\"btn\" style={{ borderRadius: '6px', padding: '6px 12px' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '6px', padding: '6px 16px', background: 'var(--app-blue)' }}");

// For Glass
glass = glass
  .replace(/background: 'var\(--app-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-window-bg\)'/g, "background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)'")
  .replace(/background: 'var\(--app-panel\)'/g, "background: 'rgba(255, 255, 255, 0.1)'")
  .replace(/border: '1px solid var\(--app-border\)'/g, "border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px'")
  .replace(/className="app-window"/g, "className=\"app-window\" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="app-titlebar"/g, "className=\"app-titlebar\" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', fontSize: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}")
  .replace(/className="btn"/g, "className=\"btn\" style={{ borderRadius: '12px', padding: '8px 16px', background: 'rgba(255,255,255,0.1)' }}")
  .replace(/className="btn btn-primary"/g, "className=\"btn btn-primary\" style={{ borderRadius: '12px', padding: '8px 24px', background: 'linear-gradient(135deg, var(--app-blue), #6366f1)', border: 'none' }}");


fs.writeFileSync('src/app/seed-wizard/components/SeedWizardDarkside.tsx', darkside);
fs.writeFileSync('src/app/seed-wizard/components/SeedWizardGlass.tsx', glass);
console.log('Themes generated');
