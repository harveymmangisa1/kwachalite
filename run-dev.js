const { exec } = require('child_process');

console.log('Starting Next.js development server on port 9002...');

const command = 'node_modules\.bin\next dev -p 9002';

const child = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error starting server: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

// Keep the script running
cat.stdout.pipe(process.stdout);
cat.stderr.pipe(process.stderr);
process.stdin.pipe(cat.stdin);