# setup-bazelisk
Set up your GitHub Actions workflow with a specific version of Baelisk

<p align="left">
  <a href="https://github.com/mishas/setup-bazelisk-action/actions"><img alt="versions status" src="https://github.com/mishas/setup-bazelisk-action/workflows/bazelisk-versions/badge.svg"></a>
</p>

This action sets up Bazelisk for use in actions by:

- optionally downloading and caching a version of Bazelisk by version and adding to PATH
- setting up cache for downloaded Bazel versions

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@master
- uses: mishas/setup-bazelisk@v1
  with:
    bazelisk-version: '1.x'
- name: Mount bazel cache  # Optional
  uses: actions/cache@v1
  with:
    path: "/home/runner/.cache/bazel"
    key: bazel
- run: bazel build //...
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
