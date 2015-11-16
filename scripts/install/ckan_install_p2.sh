#! /bin/bash

echo "Do you wish to continue? [Y/n]"

read -n 1 answer
if [ $answer != "Y" ]; then
        echo "bye bye"
        exit
fi

echo "Continuing install..."

jettycmd=jetty8
if [ -f /etc/default/jetty ]; then
	jettycmd=jetty
fi

echo "**** Starting jetty"
sudo service $jettycmd start

echo "**** Replacing SOLR default schema with CKAN schema"
if [ ! -f /etc/solr/conf/schema.xml.bak ]; then
  echo "**** Backing up old schema file"
  sudo mv /etc/solr/conf/schema.xml /etc/solr/conf/schema.xml.bak
fi

if [ -f /etc/solr/conf/schema.xml ]; then
  sudo rm /etc/solr/conf/schema.xml
fi

sudo ln -s /usr/lib/ckan/default/src/ckan/ckan/config/solr/schema.xml /etc/solr/conf/schema.xml

echo "**** Restarting jetty"
sudo service $jettycmd restart

sleep 2

echo "**** Creating PG tables"
. /usr/lib/ckan/default/bin/activate
cd /usr/lib/ckan/default/src/ckan
paster db init -c /etc/ckan/default/development.ini

echo "**** Linking who.ini"
if [ ! -f /etc/ckan/default/who.ini ]; then
  ln -s /usr/lib/ckan/default/src/ckan/who.ini /etc/ckan/default/who.ini
fi

echo "**** Starting CKAN"
echo ". /usr/lib/ckan/default/bin/activate"
echo "cd /usr/lib/ckan/default/src/ckan"
echo "paster serve /etc/ckan/default/development.ini"

paster serve /etc/ckan/default/development.ini