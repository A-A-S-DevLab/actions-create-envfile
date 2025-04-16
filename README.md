# GitHub Action - Replace placeholders

This GitHub Action helps to replace all placeholders in file


## Usage

Add this step in your workflow file
```yaml
-   name: Replace placeholders in file
    uses: A-A-S-DevLab/actions-replace-placeholders@1.0.0
    with:
        template_path: 'template.txt'
        data_path: 'data.json'
        output_path: 'result.txt'
```

## Input Variables

- `template_path`: Path to the template file.
- `data_path`: Path to the JSON data file.
- `output_path`: Path to save the output file.
