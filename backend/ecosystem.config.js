// PM2 config — run multiple backend instances behind a load balancer
module.exports = {
  apps: [{
    name: 'verdura-api',
    script: 'dist/index.js',
    instances: 'max',          // one per CPU core
    exec_mode: 'cluster',      // Node cluster mode — shared port, load balanced
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    // Auto-restart on crash, memory leak guard
    max_memory_restart: '512M',
    restart_delay: 1000,
    max_restarts: 10,
    // Zero-downtime deploys
    wait_ready: true,
    kill_timeout: 5000,
    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
  }],
}
