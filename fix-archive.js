const fs = require('fs');
let f = 'src/app/en/base64-tools/base64-encoder-decoder/page.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { $1, Archive } from "lucide-react";');
fs.writeFileSync(f, c);
console.log("Added Archive import");
