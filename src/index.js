const core = require("@actions/core");
const fs = require("fs");
const path = require("path");

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
        if (!isAllowEmpty)
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
    const is_envkey_allow_empty = core.getBooleanInput('is_envkey_allow_empty');
    const default_envkey_value = core.getInput('default_envkey_value');
    const json_data = core.getInput('json_data');
    const is_json_allow_empty = core.getBooleanInput('is_json_allow_empty');
    const default_json_value = core.getInput('default_json_value');
    let output_path = core.getInput('output_path') || '.env';

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

    if (json_data !== '')
    {
        let data;
        try
        {
            data = JSON.parse(json_data);
        }
        catch
        {
            throw new Error('json_data is not a valid JSON');
        }
        if (data === null || typeof data !== 'object' || Array.isArray(data))
        {
            throw new Error('json_data must be an object');
        }

        for (const dataKey of Object.keys(data))
        {
            addEnv(dataKey, data[dataKey], is_json_allow_empty, default_json_value, 'json_data');
        }
    }

    if (output_path.startsWith('/'))
    {
        throw new Error('Absolute paths are not allowed. Please use a relative path.');
    }
    if (output_path.startsWith('./'))
    {
        output_path = output_path.slice(2);
    }
    let filePath = path.join(process.env.GITHUB_WORKSPACE, output_path);

    console.log(`dest path: ${filePath}`);

    fs.writeFileSync(filePath, envFileContent, { encoding:'utf8', flag:'a', mode: 0o600 });
    fs.chmodSync(filePath, 0o600);
}
catch (error)
{
    core.setFailed(error instanceof Error ? error.message : String(error));
}
