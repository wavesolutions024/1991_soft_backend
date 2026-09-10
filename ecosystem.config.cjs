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
        BASE_URL:"https://backend.1991tattoos.com",
        EXCEL_EXPORT_PASSWORD:"clientSheet@Admin",
        WHATSAPP_VERIFY_TOKEN:"1991@Whatsapp_token",
        WHATSAPP_ACCESS_TOKEN:"EABADiZB08efcBSQsyCAaO9c28Caj6rZCJG3oHkRL4ZCRkJGXY85nhY7u147Yn6o5FajZAcqxpO0e4oq8mzZBu4pvZCm5HEfXneBGrm8MsMQZAfOxz3PBXhd38paZByvjxDRGrEiqG1IpcZBn2f7rANayf29dvXQ8b63mzwVZBtkzj2iXrzwUWtnZBOpDqLj8ZAZApP5WH0gZDZD",
        WHATSAPP_BUSINESS_ACCOUNT_ID:"1117014760662587", 
        WHATSAPP_PHONE_NUMBER_ID:"1343549445488835",
        META_GRAPH_VERSION:"v23.0",
        META_APP_ID:"4507499142871543"
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
};