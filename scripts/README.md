## Fresh install

The following should be preformed for a fresh install (Debian / Ubuntu).

Grab git first of course :)
```
sudo apt-get install git
```

Create a directory for the application and cd there and clone repo
```
sudo mkdir -p /opt/node-apps/ecosis-search
cd /opt/node-apps/ecosis-search
sudo git clone https://github.com/CSTARS/ecosis
```

No we need to install CKAN.  This can be rough, hopefully these scripts help.
```
cd ecosis/scripts
./ckan_install.sh
```

There will be a pause for you to configure the CKAN ini file and the jetty conf
file.  There should be some help text for what you need to do in the ckan_install.sh command.
Once you have made the edits, finish up the CKAN install.
```
./ckan_install_p2.sh
```

This script will actually leave CKAN up and running (if all went well).  You can
test the system at http://localhost:5000.

Now its time to install the [EcoSIS plugin for CKAN](https://github.com/CSTARS/ckanext-ecosis).
To do this run ./ecosis_install.sh.  This will do a couple things.
- Install NodeJS
- Install MongoDB
- Install EcoSIS CKAN plugin via pip
- Install plugin pip dependencies

As many systems default package list lag behind the latest NodeJS and MongoDB versions,
this script will add repos for the latest and greatest to your sources list and
then install from there.
```
./ecosis_install.sh
```

At this point you *should* have a fully functional EcoSIS CKAN instance.  You will
also have MongoDB and NodeJS setup, which are required to run this search interface.

## Restore from Backups

If you have a backup dump (created using ./create_backup.sh), you can import using:
```
./restore_backup.sh /path/to/backup.zip
```

It's import to note, this will wipe everything and load data from the backup!  It's probably
best to backup first.  I know, mind, blown.

## Create Backup

If you want to create a new backup, simply run:
```
./create_backup.sh
```

This snapshots:
- The CKAN PostgreSQL database
- The EcoSIS MongoDB database
- All CKAN resource files (files uploaded for datasets)
- The current CKAN config file