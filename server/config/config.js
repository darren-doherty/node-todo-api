var env = process.env.NODE_ENV || "development";

switch (env) {
  case "development":
  case "test":
    var config = require("./config.json");
    var envConfig = config[env];
    Object.keys(envConfig).forEach(key => {
      process.env[key] = envConfig[key];
    });
    break;

  case "production":
    break;
}
