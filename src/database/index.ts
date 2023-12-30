import { createConnection, getConnectionOptions } from 'typeorm';

(async (host = "database_finapi") => {
  const connectionOptions = await getConnectionOptions();

  return await createConnection(
    Object.assign(connectionOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database: process.env.NODE_ENV === "test"
        ? "fin_api_test"
        : connectionOptions.database
    })
  );
})();
