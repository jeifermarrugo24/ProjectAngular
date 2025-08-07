// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
/*

 private apiUrl = `http://localhost/skinatech/api`; // ← ahora es reutilizable
  private token = `a-string-secret-at-least-256-bits-long`
 */
export const environment = {
  production: false,
  apiUrl: 'http://192.168.17.123/skinatech/api',
  token: 'a-string-secret-at-least-256-bits-long'
};
