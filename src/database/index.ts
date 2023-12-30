import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (host = "database_finapi"): Promise<Connection> => {
  const connectionOptions = await getConnectionOptions();

  return await createConnection(
    Object.assign(connectionOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database: process.env.NODE_ENV === "test"
        ? "fin_api_test"
        : connectionOptions.database
    })
  );
};
