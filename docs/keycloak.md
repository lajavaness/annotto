# User Management with Keycloak
Keycloak is an open source tool that helps for user authentication and authorization. It can act as a Single-Sign On solution and also provides user federation from other identity provider.

## Keycloak
Annotto is protected by OAuth using Keycloak. When you start annotto in production mode with `docker` or in development mode with [docker-compose](../README.md#start-for-local-development), some users will automatically
be created. [docker-compose.yml](./docker-compose.yml)

Once the service is started, you can manage your Keycloak instance at your will.
Thanks for those files that are imported directly at keycloak startup 
1. [Realm](../statics/keycloak/annotto-realm.json)
2. [Users](../statics/keycloak/annotto-users-0.json)

### Keycloak Administration Console
If you want to reach Keycloak Admin Console, you can go to [http://localhost:8080](http://localhost:8080) with credentials

|user|pwd|
|---|---|
|admin|admin|

### SSO Microsoft
If you want to use Annotto with an SSO such as Microsoft, you can configure keycloak to leverage this Identity Provider.
A good documentation to help doing this can be found [here](https://blog.hcltechsw.com/versionvault/how-to-configure-microsoft-azure-active-directory-as-keycloak-identity-provider-to-enable-single-sign-on-for-hcl-compass/)

Once you have your Microsoft Identity Provider setup, you will also need to define a way to map your claims and roles from Microsoft to Annotto. You can do so by using a [Mapper](https://www.keycloak.org/docs/latest/server_admin/index.html#_mappers).
Here is an example of how you set an annotto `user` role to your incoming Microsoft user.
![User Mapping](./role-user-mapping.png)

Typically, in this example, we set the role `user` at first login with Microsoft SSO. So the user is created based on the Microsoft profile and the role `user` is added to this new user in Keycloak.






