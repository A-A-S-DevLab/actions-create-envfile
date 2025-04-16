# GitHub Action - Upsert JSON values

This GitHub Action helps to create a .env file


## Usage

Add this step in your workflow file
```yaml
-   name: Create .env file
    uses: A-A-S-DevLab/actions-create-envfile@v1.0.0
    with:
        name: ".env"
        fail_on_empty: true
        envkey_debug: false
        envkey_container_name: ${{ env.CONTAINER_NAME }}
        envkey_service_network: ${{ env.SERVICE_NETWORK }}
        envkey_service_port: ${{ env.SERVICE_PORT }}
        envkey_server_local_ip: ${{ env.SERVER_LOCAL_IP }}
        envkey_image_version: ${{ env.IMAGE_VERSION }}
```

## Input Variables

- `name`: The filename for the envfile. Defaults to .env.
- `directory`: The directory to put the envfile in.
- `fail_on_empty`: Fail if an env key is an empty string. Default to false.
- `sort_keys`: Sort the keys alphabetically. Default to false.
- `envkey_some_env`: These values can be whatever, and they will be added to the '.env' file as `SOME_ENV`.
                                    
## 

This repo was forked and modified.
Original: https://github.com/SpicyPizza/create-envfile
