[![Dependencies Status](https://david-dm.org/logerfo/close-action/dev-status.svg)](https://david-dm.org/logerfo/close-action?type=dev)

# Close Action
This action will automatically close issues fixed in pull requests that doesn't target the default branch.

## Setting up
Create a file named `.github/workflows/close.yml`.

### Minimal Configuration
```yml
name: Close
on: 
  pull_request:
    types: [closed]
    
jobs:
  build:
    name: Close
    runs-on: ubuntu-16.04
    steps:
    - uses: Logerfo/close-action@0.0.1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Complete configuration
All values are default.
```yml
name: Close
on: 
  pull_request:
    types: [closed]
    
jobs:
  build:
    name: Close
    runs-on: ubuntu-16.04
    steps:
    - uses: Logerfo/close-action@0.0.1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }} # The `GITHUB_TOKEN` secret.
        comment: true # If `true`, will comment on the closing issue(s).
```

### Auto update
You can use (at your own risk) the `release` branch instead of the specific version tag.  
Never user `master`, since the distribution file does not exist in this branch and the action will always fail.

## Changelog
Click [here](CHANGELOG.md).

## Contributing
If you have suggestions for how close-label could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Donate

<img src="https://i.imgur.com/ndlBtuX.png" width="200">

BTC: 1LoGErFoNzE1gCA5fzk6A82nV6iJdKssSZ
