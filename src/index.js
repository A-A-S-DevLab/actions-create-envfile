const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

try
{
    const templatePath = core.getInput('template_path');
    const dataPath = core.getInput('data_path');
    const outputPath = core.getInput('output_path') || 'output.txt';

    // Read template and data
    const template = fs.readFileSync(templatePath, 'utf-8');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Replace placeholders like ${{key}}
    const output = template.replace(/\$\{\{(.*?)\}\}/g, (match, key) => {
        const value = data[key.trim()];
        return value !== undefined ? value : match;
    });

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${outputDir}`);
    }

    // Write output file
    fs.writeFileSync(outputPath, output);
    
    console.log(`✅ Placeholders replaced. Output saved to ${outputPath}`);
}
catch (error)
{
    core.setFailed(`❌ Error: ${error.message}`);
}