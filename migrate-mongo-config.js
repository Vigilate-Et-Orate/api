const config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "test",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  migrationsDir: "migrations",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".ts"
};
module.exports = config;