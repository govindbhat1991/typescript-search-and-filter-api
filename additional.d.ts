declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PG_HOST: string;
    PG_PORT: string;
    PG_USER: string;
    PG_PASSWORD: string;
    PG_DB: string;
    PORT: string;
    JWT_PRIVATE_KEY: string;
    JWT_PUBLIC_KEY: string;
    AWS_S3_ACCESS_KEY: string;
    AWS_S3_SECRET_KEY: string;
    AWS_S3_REGION: string;
    AWS_S3_BUCKET_NAME: string;
  }
}
