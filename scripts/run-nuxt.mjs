const FORCE_WASM_FLAGS = {
  OXC_PARSER_FORCE_WASM: '1',
  OXC_PARSER_ALLOW_WASM: 'true',
};

for (const [key, value] of Object.entries(FORCE_WASM_FLAGS)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

async function importCliModule() {
  const importers = [
    () => import('nuxt/cli'),
    () => import('nuxt/dist/cli'),
    () => import('nuxi/cli'),
    () => import('nuxi/dist/cli'),
    () => import('nuxi'),
  ];

  const errors = [];

  for (const importer of importers) {
    try {
      return await importer();
    } catch (error) {
      errors.push(error);
    }
  }

  console.error('Nuxt CLI を読み込めませんでした。nuxt または nuxi が依存関係としてインストールされているか確認してください。');
  for (const error of errors) {
    console.error(error);
  }
  process.exit(1);
  return undefined;
}

function extractRunner(cliModule) {
  const candidateObjects = [cliModule, cliModule?.default];
  const candidateKeys = ['runMain', 'main', 'run', 'invoke'];

  for (const candidate of candidateObjects) {
    if (typeof candidate === 'function') {
      return candidate;
    }

    for (const key of candidateKeys) {
      const fn = candidate?.[key];
      if (typeof fn === 'function') {
        return fn.bind(candidate);
      }
    }
  }

  return undefined;
}

async function main() {
  const cliModule = await importCliModule();
  if (!cliModule) {
    return;
  }

  const run = extractRunner(cliModule);

  if (!run) {
    console.error('Nuxt CLI エントリーポイントの形式が予期せぬものでした。');
    process.exit(1);
    return;
  }

  try {
    const exitCode = await run(process.argv.slice(2));
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
