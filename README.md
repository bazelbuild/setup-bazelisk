# setup-bazelisk
Set up your GitHub Actions workflow with a specific version of Baelisk

![Validate 'setup-bazelisk'](https://github.com/mishas/setup-bazelisk-action/workflows/Validate%20'setup-bazelisk'/badge.svg)

This action sets up Bazelisk for use in actions by:

- optionally downloading and caching a version of Bazelisk by version and adding to PATH
- setting up cache for downloaded Bazel versions

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@v2
- uses: mishas/setup-bazelisk-action@v1
- name: Mount bazel cache  # Optional
  uses: actions/cache@v2
  with:
    path: "~/.cache/bazel"
    key: bazel
- run: bazel build //...
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
