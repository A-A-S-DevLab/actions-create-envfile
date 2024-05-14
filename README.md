# GitHub Action - Upsert JSON values

This GitHub Action helps to create a .env file


## Usage

Add this step in your workflow file
```yaml
    - name: Create envfile
        uses: A-A-S-DevLab/actions-create-envfile@v1.0.0
        with:
            directory: target/folder/
            file_name: .env
            fail_on_empty: true
            sort_keys: false
            envkey_DEBUG: false
            envkey_SOME_API_KEY: "123456abcdef"
            envkey_SECRET_KEY: ${{ secrets.SECRET_KEY }}
            envkey_VARIABLE: ${{ vars.SOME_ACTION_VARIABLE }}
            some_other_variable: foobar
```

## Input Variables

- `name`: The name of the file to be written (e.g. 'settings.json')
- `json`: The JSON string that can be a secret of the github repo or a string of a JSON (e.g. '{ 'key1': 'value1' }')
- `dir`: Optional subfolder directory to save the json file (e.g. src/)

In the example above, there are several key/value pairs that will be added to
the '.env' file:

| Name                                  | Description                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `envkey_DEBUG`, `envkey_SOME_API_KEY`, `envkey_VARIABLE` | These values can be whatever, and they will be added to the '.env' file as `DEBUG`, `SOME_API_KEY` and `VARIABLE` .                                                                  |
| `envkey_SECRET_KEY`                   | This one will use a secret stored in the repository's GitHub Secrets, and add it to the file as  `SECRET_KEY`                                                            |
| `directory` (**Optional**)            | This key will set the directory in which you want to create `env` file. **Important: cannot start with `/`. Action will fail if the specified directory doesn't exist.** |
| `file_name` (**Optional**)            | Set the name of the output '.env' file. Defaults to `.env`                                                                                                               |
| `fail_on_empty` (**Optional**)        | If set to true, the Action will fail if any env key is empty. Default to `false`.                                                                                        |
| `sort_keys` (**Optional**)            | If set to true, the Action will sort the keys in the output '.env' file. Default to `false`.                                                                             |

Assuming that the GitHub Secret that was used is `password123`, the '.env' file
that is created from the config above would contain:

```text
DEBUG=false
SOME_API_KEY="123456abcdef"
SECRET_KEY=password123
VARIABLE=some_var
```

### Multiline Secrets

This Action supports multiline secrets, as described in [the nodejs dotenv
readme](https://github.com/motdotla/dotenv#multiline-values).

You may have a secret that requres multiple lines, like a private key. You can
store this in a GitHub Secret, and use it as any other secret in this Action:

```sh
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
Kh9NV...
...
-----END RSA PRIVATE KEY-----"
```

It will get stored as a single line in the '.env' file. This line will start and
end with a `"` character, and will contain `\n` characters to represent the
newlines:

```sh
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nKh9NV...\n-----END RSA PRIVATE KEY-----\n"
```

## Potential Issues

### Warnings

When the Action runs, it will show `Warning: Unexpected input(s) ...`. This is
because GitHub is expecting all the potential input variables to be defined by
the Action's definition. You can read more about it in [this
issue](https://github.com/SpicyPizza/create-envfile/issues/10).

![](https://user-images.githubusercontent.com/12802646/106284483-594e2300-6254-11eb-9e5d-3a6426da0435.png)

## Credits

This repo was forked and modified.
Original: https://github.com/SpicyPizza/create-envfile
