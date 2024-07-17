import dotenv from 'dotenv';

dotenv.config({});

class Config {
  public NODE_ENV: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public MYSQL_DB: string | undefined;
  public JWT_TOKEN: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public GATEWAY_JWT_TOKEN: string | undefined;
  public API_GATEWAY_URL: string | undefined;
  public CLIENT_URL: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.MYSQL_DB = process.env.MYSQL_DB || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
  }
}

export const config: Config = new Config();
