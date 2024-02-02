# setup-bazelisk v3
Set up your GitHub Actions workflow with a specific version of Bazelisk

Note that GitHub Actions includes Bazelisk by default as of <https://github.com/actions/virtual-environments/pull/490> so this setup is not necessary unless you want to customize the Bazelisk version, or are running Bazel inside a container.

![Validate 'setup-bazelisk'](https://github.com/bazelbuild/setup-bazelisk/workflows/Validate%20'setup-bazelisk'/badge.svg)

This action sets up Bazelisk for use in actions by:

- optionally downloading and caching a version of Bazelisk by version and adding to PATH
- setting up cache for downloaded Bazel versions

# What's new

- Updated to the node20 runtime by default
  - This requires a minimum [Actions Runner](https://github.com/actions/runner/releases/tag/v2.308.0) version of v2.308.0 to run.

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@v4
- uses: bazelbuild/setup-bazelisk@v3
- name: Mount bazel cache  # Optional
  uses: actions/cache@v4
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
