import { ArchiveFormat } from '../archive'
import { FunctionConfig } from '../config'
import { FeatureFlags } from '../feature_flags'
import { FunctionSource, SourceFile } from '../function'
import { FsCache } from '../utils/fs'

import type { NodeBundlerName } from './node'

type RuntimeName = 'go' | 'js' | 'rs'

type FindFunctionsInPathsFunction = (args: {
  featureFlags: FeatureFlags
  fsCache: FsCache
  paths: string[]
}) => Promise<SourceFile[]>

type GetSrcFilesFunction = (
  args: {
    basePath?: string
    config: FunctionConfig
    featureFlags: FeatureFlags
    repositoryRoot?: string
  } & FunctionSource,
) => Promise<string[]>

interface ZipFunctionResult {
  bundler?: NodeBundlerName
  bundlerErrors?: object[]
  bundlerWarnings?: object[]
  config: FunctionConfig
  inputs?: string[]
  nativeNodeModules?: object
  nodeModulesWithDynamicImports?: string[]
  path: string
}

type ZipFunction = (
  args: {
    archiveFormat: ArchiveFormat
    basePath?: string
    config: FunctionConfig
    destFolder: string
    featureFlags: FeatureFlags
    repositoryRoot?: string
  } & FunctionSource,
) => Promise<ZipFunctionResult>

interface Runtime {
  findFunctionsInPaths: FindFunctionsInPathsFunction
  getSrcFiles?: GetSrcFilesFunction
  name: RuntimeName
  zipFunction: ZipFunction
}

export { FindFunctionsInPathsFunction, GetSrcFilesFunction, Runtime, RuntimeName, ZipFunction, ZipFunctionResult }
