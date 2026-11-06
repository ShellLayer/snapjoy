// Test-only graphics selection. Production launches use the operating-system defaults.
const graphicsArgs = process.env.SNAPJOY_TEST_GL_ARGS
  ? JSON.parse(process.env.SNAPJOY_TEST_GL_ARGS)
  : process.platform === 'darwin' ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];
const packageArch = process.env.SNAPJOY_PACKAGE_ARCH || process.arch;
module.exports = { graphicsArgs, packageArch };
