#!/bin/bash

/opt/keycloak/bin/standalone.sh -b 0.0.0.0 -bmanagement 0.0.0.0 \
-Dkeycloak.migration.action=import \
-Dkeycloak.migration.provider=dir \
-Dkeycloak.migration.realmName=annotto \
-Dkeycloak.migration.dir=/tmp/keycloak-import \
-Dkeycloak.migration.strategy=IGNORE_EXISTING \
-Dkeycloak.migration.usersExportStrategy=SAME_FILE \
-Dkeycloak.profile.feature.upload_scripts=enabled &

/usr/sbin/nginx -g 'daemon off;' &
mongod &
node /opt/annotto-api/src/index.js &

wait -n

exit $?
