const fs = require('fs');
let f = 'src/app/en/json-tools/json-diff/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/\{Boolean\(origError \|\| modError\) && \(/, '{(origError || modError) ? (');
c = c.replace(/\{\(original \|\| modified\) && \(/, '{(original || modified) ? (');
c = c.replace(/<\/Alert>\n                    \)}\n                <\/div>\n            \)}/, '</Alert>\n                    )}\n                </div>\n            ) : null}');
c = c.replace(/<\/Tooltip>\n                \)}\n            <\/div>/, '</Tooltip>\n                ) : null}\n            </div>');

fs.writeFileSync(f, c);
console.log("Fixed ternary!");
