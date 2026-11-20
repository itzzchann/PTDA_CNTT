const config = require("./config");
const app = require("./app");

app.listen(config.PORT, () => {
  console.log(`RoPhim API: http://localhost:${config.PORT}/api/health`);
});
