#!/bin/sh

if [ -z "$1" ]; then
  echo "Must supply bazelisk version argument"
  exit 1
fi

full_bazel_version="$(bazel version)"
bazelisk_version=$(echo "$full_bazel_version" | grep 'Bazelisk version:')
bazel_version=$(echo "$full_bazel_version" | grep 'Build label:')
echo "Found bazelisk version '$bazelisk_version'"
echo "Found bazel version '$bazel_version'"

if [ -z "$(echo $bazelisk_version | grep $1)" ]; then
  echo "Unexpected bazelisk version"
  exit 1
fi

expected_bazel_version="${USE_BAZEL_VERSION:-xxx}"
if [ -z "$(echo $bazel_version | grep $expected_bazel_version)" ]; then
  echo "Unexpected bazel version"
  exit 1
fi
