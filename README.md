# setup-bazelisk
Set up your GitHub Actions workflow with a specific version of Bazelisk

![Validate 'setup-bazelisk'](https://github.com/bazelbuild/setup-bazelisk/workflows/Validate%20'setup-bazelisk'/badge.svg)

This action sets up Bazelisk for use in actions by:

- optionally downloading and caching a version of Bazelisk by version and adding to PATH
- setting up cache for downloaded Bazel versions

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@v2
- uses: bazelbuild/setup-bazelisk@v1
- name: Mount bazel cache  # Optional
  uses: actions/cache@v2
  with:
    path: "~/.cache/bazel"
    key: bazel
- run: bazel build //...
```

# Known issues on Windows
* This action doesn't work with PowerShell. Make sure to have `shell: bash` in you `run:` steps. ([#3](https://github.com/bazelbuild/setup-bazelisk/issues/3))
* Windows removes one of the slashes (`/`) when two are present (`bazel test //tests/...` becomes `bazel test /tests/...` and fails). ([#4](https://github.com/bazelbuild/setup-bazelisk/issues/4))  
  As a workaround, don't have any prefix `//`. Since all runs start at WORKSPACE dir, it should work all the same.

Full workaround example on windows:
```yaml
- name: Run tests
  run: bazel test tests/...
  shell: bash
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
