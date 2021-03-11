const { basename, join } = require('path')

const cpFile = require('cp-file')

const { JS_BUNDLER_ESBUILD, JS_BUNDLER_ESBUILD_ZISI, JS_BUNDLER_ZISI, RUNTIME_JS } = require('../../utils/consts')

const { getDefaultBundler } = require('./default_bundler')
const { findFunctionsInPaths } = require('./finder')
const { getSrcFiles } = require('./src_files')
const { zipEsbuild } = require('./zip_esbuild')
const { zipZisi } = require('./zip_zisi')

const zipFunction = async function ({
  destFolder,
  extension,
  filename,
  jsBundler: explicitJsBundler,
  jsExternalModules,
  jsIgnoredModules,
  mainFile,
  pluginsModulesPath,
  srcDir,
  srcPath,
  stat,
}) {
  // If the file is a zip, we assume the function is bundled and ready to go.
  // We simply copy it to the destination path with no further processing.
  if (extension === '.zip') {
    const destPath = join(destFolder, filename)
    await cpFile(srcPath, destPath)
    return { path: destPath }
  }

  const jsBundler = explicitJsBundler || getDefaultBundler({ extension })
  const destPath = join(destFolder, `${basename(filename, extension)}.zip`)

  if (jsBundler === JS_BUNDLER_ZISI) {
    return zipZisi({
      destFolder,
      destPath,
      extension,
      filename,
      mainFile,
      pluginsModulesPath,
      srcDir,
      srcPath,
      stat,
    })
  }

  return zipEsbuild({
    destFolder,
    destPath,
    extension,
    filename,
    jsExternalModules,
    jsIgnoredModules,
    mainFile,
    pluginsModulesPath,
    srcDir,
    srcPath,
    stat,
  })
}

const zipWithFunctionWithFallback = async ({ jsBundler, ...parameters }) => {
  // If a specific JS bundler version is specified, we'll use it.
  if (jsBundler !== JS_BUNDLER_ESBUILD_ZISI) {
    return zipFunction({ ...parameters, jsBundler })
  }

  // Otherwise, we'll try to bundle with esbuild and, if that fails, fallback
  // to zisi.
  try {
    return await zipFunction({ ...parameters, jsBundler: JS_BUNDLER_ESBUILD })
  } catch (esbuildError) {
    try {
      const data = await zipFunction({ ...parameters, jsBundler: JS_BUNDLER_ZISI })

      return { ...data, bundlerErrors: esbuildError.errors }
    } catch (zisiError) {
      throw esbuildError
    }
  }
}

module.exports = { findFunctionsInPaths, getSrcFiles, name: RUNTIME_JS, zipFunction: zipWithFunctionWithFallback }