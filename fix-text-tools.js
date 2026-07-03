const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/en/text-tools/**/*.tsx');

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    
    // In button groups, the buttons shouldn't have rounded-md, border, or shadow-sm.
    // They should just have `bg-white text-black border-r border-border last:border-r-0` etc.
    // But since the regex from fix-btn.js replaced `<Button variant="outline" size="sm"` everywhere,
    // let's specifically target buttons that are inside a button group.
    
    // The button group wrapper is usually: <div className="flex shadow-sm rounded-md overflow-hidden">
    // So any button inside it should be styled like a segmented control item.
    // Since it's hard to parse JSX with regex, let's just globally replace the overly aggressive white button styling
    // IF it's in a text tool that uses button groups.
    
    c = c.replace(/className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border border-border shadow-sm gap-1\.5 h-8 px-3 text-xs rounded-md transition-all font-medium"/g, 
        'className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-r border-border last:border-r-0 gap-1.5 h-8 px-3 text-xs transition-all font-medium"');
        
    fs.writeFileSync(f, c);
});

console.log("Fixed text tools button groups!");
