const fs = require('fs');
let f = 'src/app/en/json-tools/json-diff/page.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(/\{\(origError \|\| modError\) && \(/, '{(origError || modError) ? (');
c = c.replace(/<\/Alert>\n                    \)}\n                    \{modError && \(/, '</Alert>\n                    ) : null}\n                    {modError ? (');
c = c.replace(/\{origError && \(/, '{origError ? (');
c = c.replace(/<\/Alert>\n                    \)}\n                <\/div>\n            \)}/, '</Alert>\n                    ) : null}\n                </div>\n            ) : null}');

c = c.replace(/\{\(original \|\| modified\) && \(/, '{(original || modified) ? (');
c = c.replace(/<\/Tooltip>\n                \)}\n            <\/div>/, '</Tooltip>\n                ) : null}\n            </div>');

fs.writeFileSync(f, c);
console.log("Fixed ternary!");
