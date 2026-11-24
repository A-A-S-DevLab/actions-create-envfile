# GitHub Action - Create .env file

Creates a `.env` file for docker compose from `envkey_*` inputs and a JSON object.

## Usage

```yaml
-   name: Create .env file
    uses: A-A-S-DevLab/actions-create-envfile@v2.0.0
    with:
        is_envkey_allow_empty: false
        envkey_container_name: ${{ env.CONTAINER_NAME }}
        envkey_service_port: ${{ env.SERVICE_PORT }}
        json_data: ${{ steps.service_secrets.outputs.credentials }}
        output_path: './copy-to-host/.env'
```

## Inputs

- `is_envkey_allow_empty` — optional, default `true`. Allow empty `envkey_*` values: `true` — an empty value is replaced by `default_envkey_value`, `false` — the step fails.
- `default_envkey_value` — optional, default `_`. Value for an empty `envkey_*` value.
- `envkey_*` — optional. `envkey_some_env` is written as `SOME_ENV`.
- `json_data` — optional, default empty. JSON object `{"key": "value"}`, its keys are written after the `envkey_*` keys: `db_password` → `DB_PASSWORD`.
- `is_json_allow_empty` — optional, default `true`. Allow empty `json_data` values: `true` — an empty value is replaced by `default_json_value`, `false` — the step fails.
- `default_json_value` — optional, default `_`. Value for an empty `json_data` value.
- `output_path` — optional, default `.env`. Path to the `.env` file, relative to the workspace.

## Rules

- Keys may contain only `A-Z`, `a-z`, `0-9` and `_`, not starting with a digit, and are written in upper case. A repeated key, also in another case or from both `envkey_*` and `json_data`, fails the step.
- Values in `json_data` must be strings, numbers, booleans or `null`; an empty string and `null` are empty values.
- Values are written in double quotes with escaped `\`, `"`, `$` and line breaks: `KEY="a\$b\n"`. Docker compose reads them as is, without interpolation, comments or trimming.
- The file is overwritten and gets mode `0600`: it contains secrets.
- `output_path` must be relative; a missing directory is created.

## Logs

Key names only, values are never logged:

```
🟡 Empty value of SMTP_PASSWORD in json_data: replaced by default
📁 Created directory: copy-to-host
✅ Updated: copy-to-host/.env (CONTAINER_NAME, SERVICE_PORT, DB_PASSWORD, SMTP_PASSWORD)
```

An error fails the step: `❌ Error: Duplicate env key DB_PASSWORD`.

## Origin

Forked and modified from https://github.com/SpicyPizza/create-envfile
