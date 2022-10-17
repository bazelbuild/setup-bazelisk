import * as core from '@actions/core';
import * as github from '@actions/github';
import * as hc from '@actions/http-client';
import * as semver from 'semver';
import * as tc from '@actions/tool-cache';
import fs from 'fs';
import os from 'os';

export interface IBazeliskAsset {
  name: string;
  browser_download_url: string;
}

export interface IBazeliskVersion {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  assets: IBazeliskAsset[];
}

export async function getBazelisk(
  versionSpec: string,
  token: string
): Promise<string> {
  const toolPath: string = tc.find('bazelisk', versionSpec);

  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`);
    return toolPath;
  }

  core.info(`Attempting to download ${versionSpec}...`);

  // Possible values are 'aix', 'darwin', 'freebsd','linux', 'openbsd', 'sunos' and 'win32'.
  // Bazelisk filenames use 'darwin', 'linux' and 'windows'.
  let osPlatform: string = os.platform();
  if (osPlatform == 'win32') {
    osPlatform = 'windows';
  }
  // Possible values are 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x' and 'x64'.
  // Bazelisk filenames use 'amd64' and 'arm64'.
  let osArch: string = os.arch();
  if (osArch == 'x64') {
    osArch = 'amd64';
  }
  let osFileName: string = `bazelisk-${osPlatform}-${osArch}`;
  if (osPlatform == 'windows') {
    osFileName = osFileName.concat('.exe');
  }

  const info = await findMatch(versionSpec, osFileName, token);
  if (!info) {
    throw new Error(
      `Unable to find Bazelisk version '${versionSpec}' for platform ${osPlatform} and arch ${osArch}.`
    );
  }
  return await cacheBazelisk(info, osFileName, token);
}

async function cacheBazelisk(
  info: IBazeliskVersion,
  osFileName: string,
  token: string
): Promise<string> {
  const downloadPrefix: string =
    'https://github.com/bazelbuild/bazelisk/releases/download';
  const downloadUrl: string = `${downloadPrefix}/${info.tag_name}/${osFileName}`;
  core.info(`Acquiring ${info.tag_name} from ${downloadUrl}`);
  const auth = `token ${token}`;
  const downloadPath: string = await tc.downloadTool(
    downloadUrl,
    undefined,
    auth
  );

  core.info('Adding to the cache ...');
  fs.chmodSync(downloadPath, '755');
  const cachePath: string = await tc.cacheFile(
    downloadPath,
    'bazel',
    'bazelisk',
    info.tag_name
  );
  core.info(`Successfully cached bazelisk to ${cachePath}`);
  return cachePath;
}

async function findMatch(
  versionSpec: string,
  osFileName: string,
  token: string
): Promise<IBazeliskVersion | undefined> {
  let versions = new Map<string, IBazeliskVersion>();
  let bazeliskVersions = await getVersionsFromDist(token);

  bazeliskVersions.forEach((bazeliskVersion: IBazeliskVersion) => {
    const hasRelevantAsset: boolean = bazeliskVersion.assets.some(
      (asset: IBazeliskAsset) => {
        return asset.name == osFileName;
      }
    );
    if (hasRelevantAsset) {
      const version: semver.SemVer | null = semver.coerce(
        bazeliskVersion.tag_name
      );
      if (version) {
        versions.set(version.version, bazeliskVersion);
      }
    }
  });

  // get the latest version that matches the version spec
  let version: string = evaluateVersions(
    Array.from(versions.keys()),
    versionSpec
  );
  return versions.get(version);
}

async function getVersionsFromDist(token: string): Promise<IBazeliskVersion[]> {
  const octokit = github.getOctokit(token);
  const {data: response} = await octokit.repos.listReleases({
    owner: 'bazelbuild',
    repo: 'bazelisk'
  });
  return response || [];
}

// Copied from @actions/tool-cache.
function evaluateVersions(versions: string[], versionSpec: string): string {
  let version = '';
  core.debug(`evaluating ${versions.length} versions`);
  versions = versions.sort((a, b) => {
    if (semver.gt(a, b)) {
      return 1;
    }
    return -1;
  });
  for (let i = versions.length - 1; i >= 0; i--) {
    const potential: string = versions[i];
    const satisfied: boolean = semver.satisfies(potential, versionSpec);
    if (satisfied) {
      version = potential;
      break;
    }
  }

  if (version) {
    core.debug(`matched: ${version}`);
  } else {
    core.debug('match not found');
  }

  return version;
}
