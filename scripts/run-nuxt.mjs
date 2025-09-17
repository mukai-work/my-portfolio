import { spawn } from 'node:child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Missing Nuxt command.');
  process.exit(1);
}

if (!process.env.OXC_PARSER_FORCE_WASM) {
  process.env.OXC_PARSER_FORCE_WASM = '1';
}

const command = process.platform === 'win32' ? 'nuxt.cmd' : 'nuxt';

const child = spawn(command, args, {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', (error) => {
  console.error(error);
  process.exit(1);
});
