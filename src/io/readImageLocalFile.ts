import path from 'path'
import mime from 'mime-types'

import mimeToIO from './internal/MimeToImageIO.js'
import getFileExtension from './getFileExtension.js'
import extensionToIO from './internal/extensionToImageIO.js'
import ImageIOIndex from './internal/ImageIOIndex.js'

import Image from '../core/Image.js'

import loadEmscriptenModule from '../core/internal/loadEmscriptenModuleNode.js'
import readImageEmscriptenFSFile from './internal/readImageEmscriptenFSFile.js'
import ImageIOBaseEmscriptenModule from './internal/ImageIOBaseEmscriptenModule.js'
import findLocalImageIOPath from './internal/findLocalImageIOPath.js'

/**
 * Read an image from a file on the local filesystem in Node.js.
 *
 * @param: filePath path to the file on the local filesystem.
 */
async function readImageLocalFile (filePath: string): Promise<Image> {
  const imageIOsPath = findLocalImageIOPath()
  const absoluteFilePath = path.resolve(filePath)
  const mimeType = mime.lookup(absoluteFilePath)
  const extension = getFileExtension(absoluteFilePath)

  let io = null
  if (mimeType !== false && mimeToIO.has(mimeType)) {
    io = mimeToIO.get(mimeType)
  } else if (extensionToIO.has(extension)) {
    io = extensionToIO.get(extension)
  } else {
    for (let idx = 0; idx < ImageIOIndex.length; ++idx) {
      const modulePath = path.join(imageIOsPath, ImageIOIndex[idx] + '.js')
      const Module = await loadEmscriptenModule(modulePath) as ImageIOBaseEmscriptenModule
      const imageIO = new Module.ITKImageIO()
      const mountedFilePath = Module.mountContainingDir(absoluteFilePath)
      imageIO.SetFileName(mountedFilePath)
      if (imageIO.CanReadFile(mountedFilePath)) {
        io = ImageIOIndex[idx]
        Module.unmountContainingDir(mountedFilePath)
        break
      }
      Module.unmountContainingDir(mountedFilePath)
    }
  }
  if (io === null) {
    throw Error('Could not find IO for: ' + absoluteFilePath)
  }

  const modulePath = path.join(imageIOsPath, io as string + '.js')
  const Module = await loadEmscriptenModule(modulePath) as ImageIOBaseEmscriptenModule
  const mountedFilePath = Module.mountContainingDir(absoluteFilePath)
  const image = readImageEmscriptenFSFile(Module, mountedFilePath)
  Module.unmountContainingDir(mountedFilePath)
  return image
}

export default readImageLocalFile