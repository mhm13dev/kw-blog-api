/**
 * Enum set via NODE_ENV environment variable.
 *
 * The application can run in one of the given environments.
 */
export enum NodeEnv {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}
