const fs = require('fs');
let f = 'src/app/en/json-tools/json-relationship-visualizer/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/<Chip label=\{e\.type\} size="small" sx=\{\{[\s\S]*?\}\} \/>/, '<span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "currentColor", color: TYPE_COLORS[e.type] }}>{e.type}</span>');

fs.writeFileSync(f, c);
console.log("Fixed Chip!");
