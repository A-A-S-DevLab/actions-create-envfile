# GitHub Action - Create .env file

This GitHub Action helps to create a .env file


## Usage

Add this step in your workflow file
```yaml
-   name: Create .env file
    uses: A-A-S-DevLab/actions-create-envfile@v1.1.0
    with:
        is_envkey_allow_empty: false
        envkey_container_name: ${{ env.CONTAINER_NAME }}
        envkey_service_network: ${{ env.SERVICE_NETWORK }}
        envkey_service_port: ${{ env.SERVICE_PORT }}
        envkey_server_local_ip: ${{ env.SERVER_LOCAL_IP }}
        envkey_image_version: ${{ env.IMAGE_VERSION }}
        json_data: ${{ steps.service_secrets.outputs.credentials }}
        is_json_allow_empty: true
        output_path: ".env"
```

## Input Variables

- `is_envkey_allow_empty`: Allow empty `envkey_` values: `true` — an empty value is replaced by `default_envkey_value`, `false` — the step fails. Default to true.
- `default_envkey_value`: Value for an empty `envkey_` value. Default to `_`.
- `envkey_some_env`: These values can be whatever, and they will be added to the '.env' file as `SOME_ENV`.
- `json_data`: JSON object `{"key": "value"}`. Its keys are added after the `envkey_` keys: `db_password` → `DB_PASSWORD`.
- `is_json_allow_empty`: Allow empty `json_data` values: `true` — an empty value is replaced by `default_json_value`, `false` — the step fails. Default to true.
- `default_json_value`: Value for an empty `json_data` value. Default to `_`.
- `output_path`: Path to the .env file, relative to the workspace. A missing directory is created. Default to `.env`.

Keys may contain only `A-Z`, `a-z`, `0-9` and `_`, not starting with a digit, and are always written in upper case. A key that is already in the file (from `envkey_` or the same key in another case) fails the step.

The file is written with mode `0600`: it contains secrets.

Values are written in double quotes with escaped `\`, `"`, `$` and line breaks: `KEY="a\$b\n"`. Docker compose reads them as is, without interpolation, comments or trimming. Values in `json_data` must be strings, numbers, booleans or `null`.

## 

This repo was forked and modified.
Original: https://github.com/SpicyPizza/create-envfile
