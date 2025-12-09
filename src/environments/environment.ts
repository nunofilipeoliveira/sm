// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.




export const environment = {
  production: false,
  apiUrl:'http://localhost:8080',
  tenant_id: 3, // Adicionando tenant_id como parte do ambiente
  root:'',
  clube_id: 3
};
