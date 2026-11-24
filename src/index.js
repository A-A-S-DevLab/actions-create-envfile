const core = require("@actions/core");
const fs = require("fs");
const path = require("path");

const fileName = core.getInput('name') || '.env'
let fileDirectory = core.getInput('directory') || ''
const is_envkey_allow_empty = core.getInput('is_envkey_allow_empty') || 'true';
const is_json_allow_empty = core.getInput('is_json_allow_empty') || 'true';
const default_envkey_value = core.getInput('default_envkey_value') || '_';
const default_json_value = core.getInput('default_json_value') || '_';
const json = core.getInput('json');

function envValue(key, value, isAllowEmpty, defaultValue, source)
{
    if (value !== '')
    {
        return value;
    }
    if (isAllowEmpty !== 'true')
    {
        throw new Error(`Empty value of ${key} in ${source}`);
    }
    return defaultValue;
}

function envLine(key, value)
{
    // If the value contains newlines, replace them with the string `\n`
    // and add double quotes around the value.
    if (value.includes('\n'))
    {
        return `${key}="${value.replace(/\r?\n/g, '\\n')}"\n`;
    }
    return `${key}=${value}\n`;
}

try
{
    let envFileContent = '';
    const writtenKeys = new Set();

    function addEnv(key, value)
    {
        if (writtenKeys.has(key))
        {
            throw new Error(`Duplicate env key ${key}`);
        }
        writtenKeys.add(key);
        envFileContent += envLine(key, value);
    }

    const inputKeys = Object.keys(process.env).filter(key => key.startsWith('INPUT_ENVKEY_'));
    for (const inputKey of inputKeys)
    {
        const key = inputKey.slice('INPUT_ENVKEY_'.length).toUpperCase();
        addEnv(key, envValue(key, process.env[inputKey] || '', is_envkey_allow_empty, default_envkey_value, 'envkey_'));
    }

    if (json !== '')
    {
        let data;
        try
        {
            data = JSON.parse(json);
        }
        catch
        {
            throw new Error('json is not a valid JSON');
        }
        if (data === null || typeof data !== 'object' || Array.isArray(data))
        {
            throw new Error('json must be an object');
        }

        for (const dataKey of Object.keys(data))
        {
            const key = dataKey.toUpperCase();
            addEnv(key, envValue(key, String(data[dataKey] ?? ''), is_json_allow_empty, default_json_value, 'json'));
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
