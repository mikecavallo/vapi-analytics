module.exports = {
    apps: [
        {
            name: "vapi-analytics",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 5000,
                // Add your database URL here, or use the .env file
                // DATABASE_URL: "postgresql://user:password@host:port/db?sslmode=require"
            }
        }
    ]
};
