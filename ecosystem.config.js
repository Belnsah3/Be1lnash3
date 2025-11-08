module.exports = {
  apps: [
    {
      name: 'lumeai',
      script: 'src/server.js',
      cwd: '/home/be1lnash3/rest-api',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/lumeai-error.log',
      out_file: 'logs/lumeai-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'python-g4f',
      cwd: '/home/be1lnash3/rest-api/python-g4f',
      script: 'venv/bin/uvicorn',
      args: 'main:app --host 0.0.0.0 --port 5000',
      interpreter: 'none',
      env: {
        ADMIN_API_KEY: '56ce83efbb8ae2467f567ced95023b0958cda1f8a0704d84b6b7040628e1c632'
      },
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      error_file: 'logs/python-g4f-error.log',
      out_file: 'logs/python-g4f-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
