import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';

const FORCE_WASM_FLAGS = {
  OXC_PARSER_FORCE_WASM: '1',
  OXC_PARSER_ALLOW_WASM: 'true',
};

for (const [key, value] of Object.entries(FORCE_WASM_FLAGS)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

const require = createRequire(import.meta.url);

const CLI_IMPORT_SPECIFIERS = [
  'nuxt/cli',
  'nuxt/dist/cli',
  'nuxi/cli',
  'nuxi/dist/cli',
  'nuxi',
];

const CLI_PACKAGE_CANDIDATES = ['nuxt', 'nuxi'];

function logCollectedErrors(errors) {
  for (const entry of errors) {
    if (!entry) {
      continue;
    }

    if (entry.type === 'import' && entry.specifier) {
      console.error(`[import:${entry.specifier}]`, entry.error);
      continue;
    }

    if (entry.type === 'resolve' && entry.packageName) {
      console.error(`[resolve:${entry.packageName}]`, entry.error);
      continue;
    }

    if (entry.type === 'spawn' && entry.candidate) {
      console.error(
        `[spawn:${entry.candidate.packageName}] ${entry.candidate.path}`,
      );
      console.error(entry.error);
      continue;
    }

    if (entry.type === 'runner') {
      console.error('[runner]', entry.error);
      continue;
    }

    console.error(entry.error ?? entry);
  }
}

async function importCliModule() {
  const errors = [];

  for (const specifier of CLI_IMPORT_SPECIFIERS) {
    try {
      const module = await import(specifier);
      return { module, errors };
    } catch (error) {
      errors.push({ type: 'import', specifier, error });
    }
  }

  return { module: undefined, errors };
}

function resolveCliBinaries() {
  const candidates = [];
  const errors = [];

  for (const packageName of CLI_PACKAGE_CANDIDATES) {
    try {
      const packageJsonPath = require.resolve(`${packageName}/package.json`);
      const packageJson = require(packageJsonPath);
      const packageDir = dirname(packageJsonPath);

      const binField = packageJson?.bin;
      if (!binField) {
        continue;
      }

      const binEntries =
        typeof binField === 'string'
          ? [binField]
          : Object.values(binField).filter((value) => typeof value === 'string');

      for (const relativePath of binEntries) {
        const absolutePath = resolvePath(packageDir, relativePath);
        candidates.push({ packageName, path: absolutePath });
      }
    } catch (error) {
      errors.push({ type: 'resolve', packageName, error });
    }
  }

  return { candidates, errors };
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

function runCliBinary(binPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [binPath, ...args], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code, signal) => {
      resolve({ code, signal });
    });
  });
}

async function runCliThroughBinary(args, initialErrors) {
  const { candidates, errors: resolveErrors } = resolveCliBinaries();
  const errors = [...initialErrors, ...resolveErrors];

  if (candidates.length === 0) {
    console.error('Nuxt CLI を読み込めませんでした。nuxt または nuxi が依存関係としてインストールされているか確認してください。');
    logCollectedErrors(errors);
    process.exit(1);
    return;
  }

  for (const candidate of candidates) {
    try {
      const { code, signal } = await runCliBinary(candidate.path, args);

      if (signal) {
        try {
          process.kill(process.pid, signal);
        } catch (error) {
          errors.push({ type: 'spawn', candidate, error });
          break;
        }
        return;
      }

      if (typeof code === 'number' && code !== 0) {
        process.exit(code);
        return;
      }

      return;
    } catch (error) {
      errors.push({ type: 'spawn', candidate, error });
    }
  }

  console.error('Nuxt CLI バイナリの実行に失敗しました。');
  logCollectedErrors(errors);
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const { module: cliModule, errors } = await importCliModule();

  if (cliModule) {
    const run = extractRunner(cliModule);

    if (run) {
      try {
        const exitCode = await run(args);
        if (typeof exitCode === 'number' && exitCode !== 0) {
          process.exit(exitCode);
        }
        return;
      } catch (error) {
        console.error('Nuxt CLI 実行中にエラーが発生しました。');
        console.error(error);
        process.exit(1);
        return;
      }
    }

    errors.push({
      type: 'runner',
      error: new Error('Nuxt CLI エントリーポイントの形式が予期せぬものでした。'),
    });
  }

  await runCliThroughBinary(args, errors);
}

void main();
