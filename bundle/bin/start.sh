#!/bin/bash

/opt/keycloak/bin/kc.sh start-dev \
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
