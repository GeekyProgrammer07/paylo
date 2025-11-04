import esbuild from 'esbuild'

/** @type {import('esbuild').BuildOptions} */
const opts = {
  bundle: true,
  platform: 'node',
}

/** @type {import('esbuild').BuildOptions} */
export const serverBuildOpts = {
  ...opts,
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
}

async function watch() {
  const serverCtx = await esbuild.context(serverBuildOpts)
  await Promise.all([serverCtx.watch()])
}

watch()
