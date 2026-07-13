module.exports = {
    apps: [
        {
            name: 'spadm-api',
            cwd: './backend',
            script: 'dist/main.js',
            instances: 2,
            exec_mode: 'cluster',
            autorestart: true,
            max_memory_restart: '700M',
            time: true,
            env: { NODE_ENV: 'production' },
        },
    ],
};
