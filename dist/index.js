/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 571:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(571);
const fs = __nccwpck_require__(896);
const path = __nccwpck_require__(928);

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
module.exports = __webpack_exports__;
/******/ })()
;