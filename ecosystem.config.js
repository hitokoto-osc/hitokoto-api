module.exports = {
  apps: [
    {
      name: '@hitokoto/api.v1',
      script: './core.js',
      watch: false,
      ignore_watch: ['./data/logs'],
      interpreter: 'yarn', // absolute path to yarn ; default is node
      interpreter_args: 'start',
      exec_mode: 'fork',
      cwd: '', // the directory from which your app will be launched
      args: '', // string containing all arguments passed via CLI to script
      env_production: {
        PORT: 8000,
        NODE_ENV: 'production',
      },
    },
  ],
}
