const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend', 'web');
const backendDir = path.join(rootDir, 'backend');

function checkCommand(cmd) {
  try {
    const { execSync } = require('child_process');
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function startFrontend() {
  console.log('\x1b[36m[Frontend]\x1b[0m Starting frontend...');
  const proc = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });
  proc.on('error', (err) => {
    console.error('\x1b[31m[Frontend]\x1b[0m Failed to start:', err.message);
  });
  return proc;
}

function startBackend() {
  console.log('\x1b[36m[Backend]\x1b[0m Starting backend...');
  let cmd, args;
  if (checkCommand('uv')) {
    console.log('\x1b[36m[Backend]\x1b[0m Using uv');
    cmd = 'uv';
    args = ['run', 'python', 'main.py'];
  } else {
    console.log('\x1b[36m[Backend]\x1b[0m Using python');
    cmd = 'python';
    args = ['main.py'];
  }
  const proc = spawn(cmd, args, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  });
  proc.on('error', (err) => {
    console.error('\x1b[31m[Backend]\x1b[0m Failed to start:', err.message);
  });
  return proc;
}

const frontend = startFrontend();
const backend = startBackend();

process.on('SIGINT', () => {
  console.log('\n\x1b[33mStopping all services...\x1b[0m');
  frontend.kill();
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  frontend.kill();
  backend.kill();
  process.exit(0);
});
