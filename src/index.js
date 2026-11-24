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

function envKey(key)
{
    if (typeof key !== 'string')
    {
        throw new Error(`Key ${key} must be a string`);
    }

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key))
    {
        throw new Error(`Invalid env key ${key}: only A-Z, a-z, 0-9 and _ are allowed`);
    }

    return key.toUpperCase();
}

function envValue(key, value, isAllowEmpty, defaultValue, source)
{
    if (value !== null && typeof value === 'object')
    {
        throw new Error(`Value of ${key} in ${source} must be a string, number, boolean or null`);
    }

    let stringValue = String(value ?? '');
    if (stringValue === '')
    {
        if (isAllowEmpty !== 'true')
        {
            throw new Error(`Empty value of ${key} in ${source}`);
        }
        stringValue = defaultValue;
    }

    return stringValue
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
}

function envLine(key, value)
{
    return `${key}="${value}"\n`;
}

try
{
    let envFileContent = '';
    const writtenKeys = new Set();

    function addEnv(key, value, isAllowEmpty, defaultValue, source)
    {
        const checkedKey = envKey(key);
        const checkedValue = envValue(checkedKey, value, isAllowEmpty, defaultValue, source);

        if (writtenKeys.has(checkedKey))
        {
            throw new Error(`Duplicate env key ${checkedKey}`);
        }
        writtenKeys.add(checkedKey);

        envFileContent += envLine(checkedKey, checkedValue);
    }

    const inputKeys = Object.keys(process.env).filter(key => key.startsWith('INPUT_ENVKEY_'));
    for (const inputKey of inputKeys)
    {
        addEnv(inputKey.slice('INPUT_ENVKEY_'.length), process.env[inputKey], is_envkey_allow_empty, default_envkey_value, 'envkey_');
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
            addEnv(dataKey, data[dataKey], is_json_allow_empty, default_json_value, 'json');
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
