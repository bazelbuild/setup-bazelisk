import * as cache from '@actions/cache';
import * as core from '@actions/core';
import * as installer from './installer';
const cachedir = require('cachedir');

export async function run() {
  try {
    const versionSpec = core.getInput('bazelisk-version');
    const token = core.getInput('token');

    const installDir = await installer.getBazelisk(versionSpec, token);
    core.addPath(installDir);
    core.info('Added bazelisk to the path');

    // Restore the cache area where bazelisk stores actual Bazel executables.
    const cacheDir: string = cachedir('bazelisk');
    await cache.restoreCache([cacheDir], 'bazelisk');
    core.info(`Restored bazelisk cache dir @ ${cacheDir}`);

    core.info(`Successfully setup bazelisk version ${versionSpec}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}
