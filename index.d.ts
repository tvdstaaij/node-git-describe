import { SemVer } from "semver";

export type GitInfo = {
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
export type GitDescribeOptions = {
  dirtyMark?: string;
  dirtySemver?: boolean;
  long?: boolean;
  longSemver?: boolean;
  requireAnnotated?: boolean;
  match?: string;
  customArguments?: Array<string>;
};

export type Callback = (err: Error, gitInfo: GitInfo) => void;

export declare function gitDescribe(directory: string): Promise<GitInfo>;
export declare function gitDescribe(
  options: GitDescribeOptions
): Promise<GitInfo>;
export declare function gitDescribe(
  directory: string,
  options: GitDescribeOptions
): Promise<GitInfo>;

export declare function gitDescribe(callback: Callback): void;
export declare function gitDescribe(
  options: GitDescribeOptions,
  callback: Callback
): void;
export declare function gitDescribe(
  directory: string,
  callback: Callback
): void;
export declare function gitDescribe(
  directory: string,
  options: GitDescribeOptions,
  callback: Callback
): void;

export declare function gitDescribeSync(): GitInfo;
export declare function gitDescribeSync(directory: string): GitInfo;
export declare function gitDescribeSync(options: GitDescribeOptions): GitInfo;
export declare function gitDescribeSync(
  directory: string,
  options: GitDescribeOptions
): GitInfo;
