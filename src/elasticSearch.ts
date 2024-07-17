import { Client } from '@elastic/elasticsearch';
import { winstonLogger } from '@greatdaveo/jobint-shared';
import { Logger } from 'winston';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { config } from '@auth/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');

export const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

// To check the connection health status of the elastic search node
export async function checkConnection(): Promise<void> {
  let isConnected = false;

  while (!isConnected) {
    log.info('AuthService Connecting to ElasticSearch...');

    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});
      log.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retrying...');
      log.log('error', 'AuthService checkConnection() method: ', error);
    }
  }
}
