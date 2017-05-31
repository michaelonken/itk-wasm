import test from 'ava'
import path from 'path'

const loadModule = require(path.resolve(__dirname, '..', 'dist', 'itkloadEmscriptenModule.js'))
const itkConfig = require(path.resolve(__dirname, '..', 'dist', 'itkConfig.js'))
itkConfig.imageIOsPath = path.resolve(__dirname, '..', 'dist', 'itkImageIOs')

test('load a module', t => {
  const modulePath = path.join(itkConfig.imageIOsPath, 'itkPNGImageIOJSBinding.js')
  const loaded = loadModule(modulePath)
  t.truthy(loaded)
})