import { SemVer } from "semver";

type GitInfo = {
  dirty: boolean;
  raw: string;
  hash: string;
  distance: null | number;
  tag: null | string;
  semver: null | SemVer;
  suffix: string;
  semverString: null | string;
  toString: () => string;
};
type GitDescribeOptions = {
  dirtyMark?: string;
  dirtySemver?: boolean;
  longSemver?: boolean;
  requireAnnotated?: boolean;
  match?: string;
  customArguments?: Array<string>;
};

type Callback = (err: Error, gitInfo: GitInfo) => void;

declare function gitDescribe(directory: string): Promise<GitInfo>;
declare function gitDescribe(options: GitDescribeOptions): Promise<GitInfo>;
declare function gitDescribe(
  directory: string,
  options: GitDescribeOptions
): Promise<GitInfo>;

declare function gitDescribe(callback: Callback): void;
declare function gitDescribe(
  options: GitDescribeOptions,
  callback: Callback
): void;
declare function gitDescribe(directory: string, callback: Callback): void;
declare function gitDescribe(
  directory: string,
  options: GitDescribeOptions,
  callback: Callback
): void;

declare function gitDescribeSync(): GitInfo;
declare function gitDescribeSync(directory: string): GitInfo;
declare function gitDescribeSync(options: GitDescribeOptions): GitInfo;
declare function gitDescribeSync(
  directory: string,
  options: GitDescribeOptions
): GitInfo;
