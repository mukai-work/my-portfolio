const FORCE_WASM_FLAGS = {
  OXC_PARSER_FORCE_WASM: '1',
  OXC_PARSER_ALLOW_WASM: 'true',
};

for (const [key, value] of Object.entries(FORCE_WASM_FLAGS)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

async function main() {
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);

  let cliEntry;
  try {
    cliEntry = require.resolve('nuxt/dist/cli/index.mjs');
  } catch (error) {
    console.error('Nuxt CLI を読み込めませんでした。nuxt が依存関係としてインストールされているか確認してください。');
    console.error(error);
    process.exit(1);
    return;
  }

  try {
    const cli = await import(cliEntry);
    if (typeof cli.runMain !== 'function') {
      console.error('Nuxt CLI エントリーポイントの形式が予期せぬものでした。');
      process.exit(1);
      return;
    }

    const exitCode = await cli.runMain(process.argv.slice(2));
    if (typeof exitCode === 'number' && exitCode !== 0) {
      process.exit(exitCode);
    }
  } catch (error) {
    console.error('Nuxt CLI 実行中にエラーが発生しました。');
    console.error(error);
    process.exit(1);
  }
}

void main();
