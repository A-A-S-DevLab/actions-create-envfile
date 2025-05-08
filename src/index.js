const core = require("@actions/core");
const fs = require("fs");
const path = require("path");

const fileName = core.getInput('name') || '.env'
let fileDirectory = core.getInput('directory') || ''
const fail_on_empty = core.getInput('fail_on_empty') || 'true';
const sort_keys = core.getInput('sort_keys') || 'false';

try
{
    let envKeys;
    if (sort_keys === 'true')
    {
        envKeys = Object.keys(process.env).sort((a, b) => a.localeCompare(b));
    }
    else
    {
        envKeys = Object.keys(process.env);
    }

    let envFileContent = '';

    for (const key of envKeys)
    {
        if (key.startsWith('INPUT_ENVKEY_'))
        {
            const value = process.env[key] || '';

            if (value === '' && fail_on_empty === 'true') {
                throw new Error(`Empty env key found: ${key}`)
            }

            // If the value contains newlines, replace them with the string `\n`
            // and add double quotes around the value.
            //
            // Reference from dotenv:
            // https://github.com/motdotla/dotenv#multiline-values
            if (value.includes('\n'))
            {
                envFileContent += `${key.split('INPUT_ENVKEY_')[1]}="${value.replace(/\r?\n/g, '\\n')}"\n`;
            }
            else
            {
                envFileContent += `${key.split('INPUT_ENVKEY_')[1]}=${value}\n`;
            }
        }
    }

    if (fileDirectory.startsWith('/'))
    {
        throw new Error('Absolute paths are not allowed. Please use a relative path.');
    }
    if (fileDirectory.startsWith('./'))
    {
        fileDirectory = fileDirectory.slice(2);
    }
    let filePath = path.join(process.env.GITHUB_WORKSPACE, fileDirectory, fileName);

    console.log(`dest path: ${filePath}`);

    fs.writeFileSync(filePath, envFileContent, { encoding:'utf8', flag:'a' });
}
catch (error)
{
    if (error instanceof Error)
    {
        core.setFailed(error.message);
    }
}
