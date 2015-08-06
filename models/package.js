'use strict';

var exportIgnoreList = ['_id', 'datapoints', 'ecosis'];
var collection = global.setup.collection;

module.exports = function() {
    return {
        name: 'package',
        'export' : exportPackage
    };
};

function exportPackage(pkgid, filters, includeMetadata, callback) {
    if( pkgid === null ) {
        return callback('package_id or package_name parameter is required');
    }

    try {
      if( filters ) {
        filters = JSON.parse(filters);
      }
    } catch(e) {
      return callback('Failed to parse filters parameter as JSON');
    }

    var pkg, response, sort, i, data, metadata;

    collection.findOne(
        { '$or': [{'value.ecosis.package_id': pkgid}, {'value.ecosis.package_name': pkgid}]},
        {'value.ecosis': 1},
        function(err, result) {
          if( err ) {
            return callback(err);
          } else if( !result ) {
            return callback('package not found');
          } else if( result.length === 0 ) {
            return callback('package not found');
          }
          pkg = result.value;

          response = {
            packageName : pkg.ecosis.package_name,
            headers : [],
            stream : null
          };

          sort = pkg.ecosis.sort_on;
          if( sort === '' ) {
            sort = null;
          }

          // get all the 'data'
          data = pkg.ecosis.spectra_schema.data;
          metadata = pkg.ecosis.spectra_schema.metadata;

          // sort metadat by names
          if( includeMetadata ) {
              metadata.sort(function(a,b){
                  if( a > b ) {
                    return 1;
                  } else if( a < b ) {
                    return -1;
                  }
                  return 0;
              });
          }

          // sort data by wavelength
          var tmp = [], f;
          for( i = data.length-1; i >= 0; i-- ) {
              f = parseFloat(data[i]);
              if( isNaN(f) ) {
                  tmp.push(data.splice(i, 1)[0]);
                  continue;
              }

              data[i] = [data[i], f] ;
          }

          data.sort(function(a, b){
              if( a[1] > b[1] ) {
                return -1;
              } else if( a[1] < b[1] ) {
                return 1;
              }
              return 0;
          });

          for( i = 0; i < data.length; i++ ) {
              tmp.splice(0, 0, data[i][0]);
          }
          data = tmp;

          // write headers

          if( includeMetadata && metadata.length > 1 ) {
            response.headers = metadata;
          }
          response.headers.concat(data);

          // now write data keys as stored in mongo
          for( i = 0; i < data.length; i++ ) {
            data[i] = data[i].replace(/\./,',');
          }

          var query = {'ecosis.package_id': pkgid};
          if( filters ) {
            query.$and = filters;
          }

          var cursor = collection.find(query);
          if( sort ) {
            cursor.sort({'ecosis.sort': 1});
          }

          response.stream = cursor.stream();
          response.data = data;
          response.metadata = metadata;

          callback(null, response);
    });
}