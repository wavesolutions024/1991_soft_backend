module.exports = {
  apps: [
    {
      name: "1991_soft_backend",
      script: "./index.js",
      node_args: "--max-old-space-size=1024",
      watch: false, // set to true only during dev
      max_restarts: 5,
      restart_delay: 5000, // wait 5s between restarts
      env: {
        NODE_ENV: "production",
        HOST:"88.222.214.214",
        USER:"developer",
        PASSWORD:"Swarup@894234",
        DATABASE:"1991_crm",
        PORT:3003,
        JWT_SECRET:"1991@jwt_secret",
        BASE_URL:"https://backend.1991tattoos.com"
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
};