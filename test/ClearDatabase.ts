import { DataSource } from 'typeorm';

export const clearDatabase = async(dataSource: DataSource) =>
{
  const entities = dataSource.entityMetadatas;

  const schemaName = (dataSource.options as any).schema || 'public';
  const EXCLUDED_TABLES = ['roles', 'permissions'];

  for (const entity of entities)
  {
    if (EXCLUDED_TABLES.includes(entity.tableName)) { continue; }

    const repository = dataSource.getRepository(entity.name);

    try
    {
      await repository.query(`TRUNCATE TABLE "${schemaName}"."${entity.tableName}" CASCADE`);
    }
    catch (error)
    {
      console.log(`Error truncating ${entity.name}:`, error);
    }
  }
};
