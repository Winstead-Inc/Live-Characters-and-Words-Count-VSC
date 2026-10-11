const Fs = require('fs');
const Path = require('path');

const FilePath = Path.join(__dirname, '../out/extension.js');

if (!Fs.existsSync(FilePath)) { return; }

let Code = Fs.readFileSync(FilePath, 'utf8');

// 1. Monoliths for small if blocks (e.g., if (!Editor) { return null; })
Code = Code.replace(/([ \t]*)if \(([^)]+)\)\s*\{\s*(return [^;]+;)\s*\}/g, "$1if ($2) { $3 }");

// 2. Allman braces for normal blocks (functions, else blocks, etc.)
Code = Code.replace
(
    /^([ \t]*)(.*?)\s*\{$/gm,
    (Match, Indent, Rest) =>
    {
        if (Match.includes('return ')) { return Match; }
        
        return `${Indent}${Rest}\n${Indent}{`;
    }
);

// 3. Expanded Symmetry for complex registerCommand
Code = Code.replace
(
    /^([ \t]*)Context\.subscriptions\.push\(vscode\.commands\.registerCommand\('([^']+)', (async \(\) =>)\s*\n([ \t]*)\{/gm, 
    (Match, Indent, CommandName, AsyncFn, BraceIndent) =>
    {
        return `${Indent}Context.subscriptions.push\n${Indent}(\n${Indent}    vscode.commands.registerCommand\n${Indent}    (\n${Indent}        '${CommandName}',\n${Indent}        ${AsyncFn}\n${Indent}        {`;
    }
);

// 4. Fix closing parentheses for Expanded Symmetry
Code = Code.replace
(
    /^([ \t]*)\}\)\);$/gm,
    (Match, Indent) =>
    {
        return `${Indent}    }\n${Indent}    )\n${Indent});`;
    }
);

// 5. Add spacing to empty functions
Code = Code.replace(/function deactivate\(\)\s*\n\{\s*\n\}/gm, "function deactivate() {}");

Fs.writeFileSync(FilePath, Code);
console.log('Successfully formatted out/extension.js in LAFS.');
