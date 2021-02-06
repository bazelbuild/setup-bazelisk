import * as core from '@actions/core';
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

export async function getBazelisk(versionSpec: string): Promise<string> {
  const toolPath: string = tc.find('bazelisk', versionSpec);

  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`);
    return toolPath;
  }

  core.info(`Attempting to download ${versionSpec}...`);

  const osPlat: string = os.platform();
  let osFileName: string = `bazelisk-${osPlat}-amd64`;
  if (osPlat == 'win32') {
    osFileName = 'bazelisk-windows-amd64.exe';
  }

  const info = await findMatch(versionSpec, osFileName);
  if (!info) {
    throw new Error(
      `Unable to find Bazelisk version '${versionSpec}' for platform ${osPlat}.`
    );
  }
  return await cacheBazelisk(info, osFileName);
}

async function cacheBazelisk(
  info: IBazeliskVersion,
  osFileName: string
): Promise<string> {
  const downloadPrefix: string =
    'https://github.com/bazelbuild/bazelisk/releases/download';
  const downloadUrl: string = `${downloadPrefix}/${info.tag_name}/${osFileName}`;
  core.info(`Acquiring ${info.tag_name} from ${downloadUrl}`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);

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
  osFileName: string
): Promise<IBazeliskVersion | undefined> {
  let versions = new Map<string, IBazeliskVersion>();
  let bazeliskVersions = await getVersionsFromDist();

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

async function getVersionsFromDist(): Promise<IBazeliskVersion[]> {
  // TODO - Consider using @actions/github package for this.
  let dataUrl = 'https://api.github.com/repos/bazelbuild/bazelisk/releases';
  let httpClient = new hc.HttpClient('setup-bazelisk', [], {
    allowRetries: true,
    maxRetries: 3
  });
  let response = await httpClient.getJson<IBazeliskVersion[]>(dataUrl);
  return response.result || [];
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
