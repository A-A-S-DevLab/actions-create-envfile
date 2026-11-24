const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

function parseJsonData(jsonData) {
    let data;
    try {
        data = JSON.parse(jsonData);
    } catch {
        throw new Error('json_data is not a valid JSON');
    }
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('json_data must be an object');
    }
    for (const [key, value] of Object.entries(data)) {
        if (value !== null && typeof value === 'object') {
            throw new Error(`Value of ${key} in json_data must be a string, number, boolean or null`);
        }
    }
    return data;
}

function checkRelativePath(name, value) {
    if (path.isAbsolute(value)) {
        throw new Error(`${name} must be a relative path`);
    }
    return value;
}

function writeFile(filePath, content, mode, details) {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
        console.log(`📁 Created directory: ${dirPath}`);
    }
    fs.writeFileSync(filePath, content, {encoding: 'utf8', mode});
    if (mode !== undefined) {
        fs.chmodSync(filePath, mode);
    }
    console.log(`✅ Updated: ${filePath}${details ? ` (${details})` : ''}`);
}

function envKey(key) {
    if (typeof key !== 'string') {
        throw new Error(`Key ${key} must be a string`);
    }
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        throw new Error(`Invalid env key ${key}: only A-Z, a-z, 0-9 and _ are allowed`);
    }
    return key.toUpperCase();
}

function envValue(key, value, isAllowEmpty, defaultValue, source) {
    let stringValue = String(value ?? '');
    if (stringValue === '') {
        if (!isAllowEmpty) {
            throw new Error(`Empty value of ${key} in ${source}`);
        }
        console.log(`🟡 Empty value of ${key} in ${source}: replaced by default`);
        stringValue = defaultValue;
    }
    return stringValue
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
}

function envLine(key, value) {
    return `${key}="${value}"\n`;
}

function addEnv(envLines, key, value, isAllowEmpty, defaultValue, source) {
    const checkedKey = envKey(key);
    const checkedValue = envValue(checkedKey, value, isAllowEmpty, defaultValue, source);
    if (envLines.has(checkedKey)) {
        throw new Error(`Duplicate env key ${checkedKey}`);
    }
    envLines.set(checkedKey, envLine(checkedKey, checkedValue));
}

try {
    const isEnvkeyAllowEmpty = core.getBooleanInput('is_envkey_allow_empty');
    const defaultEnvkeyValue = core.getInput('default_envkey_value');
    const jsonData = core.getInput('json_data');
    const isJsonAllowEmpty = core.getBooleanInput('is_json_allow_empty');
    const defaultJsonValue = core.getInput('default_json_value');
    const outputPath = checkRelativePath('output_path', core.getInput('output_path') || '.env');

    const envLines = new Map();
    for (const inputKey of Object.keys(process.env).filter(key => key.startsWith('INPUT_ENVKEY_'))) {
        addEnv(envLines, inputKey.slice('INPUT_ENVKEY_'.length), process.env[inputKey], isEnvkeyAllowEmpty, defaultEnvkeyValue, 'envkey_');
    }
    if (jsonData !== '') {
        for (const [key, value] of Object.entries(parseJsonData(jsonData))) {
            addEnv(envLines, key, value, isJsonAllowEmpty, defaultJsonValue, 'json_data');
        }
    }

    writeFile(path.join(outputPath), [...envLines.values()].join(''), 0o600, [...envLines.keys()].join(', '));
} catch (error) {
    core.setFailed(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
}
