import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionQuery = await database.query("SHOW server_version;");
  const version = databaseVersionQuery.rows[0].server_version;

  const databaseMaxConnectionQuery = await database.query(
    "SHOW max_connections;",
  );
  const maxConnections = databaseMaxConnectionQuery.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpennedConnectionQuery = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const opennedConnections = databaseOpennedConnectionQuery.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    env_test: process.env.NODE_ENV,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        open_connections: opennedConnections,
      },
    },
  });
}

export default status;
