'use strict';

const util = require('util');
const csvStringify = util.promisify(require('csv-stringify'));
const BOM = '\uFEFF'; // specify utf-8 file

module.exports = async function(model, req, res) {

  var pkgid = req.params.packageId;

  var filters = req.query.filters;
  var includeMetadata = req.query.metadata ? (req.query.metadata.toLowerCase() === 'true') : false;

  /**
   * result contains packageName and stream
   */
  console.log(pkgid, filters, includeMetadata);

  let result, output;


  try {
    result = await model.export(pkgid, filters, includeMetadata);
    output = await csvStringify([result.headers]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
    return;
  }

  res.set('Content-Disposition', 'attachment; filename="'+result.packageName+'.csv"');
  res.write(BOM + output);

  var dataLength = result.data.length;
  var metadataLength = result.metadata.length;
  var line, i;

  if( includeMetadata && result.metadata.length > 1 ) {
    includeMetadata = true;
  } else {
    includeMetadata = false;
  }

  var finished = false;
  var count = 0;
  var writeCount = 0;

  // check function to make sure all is good to end response
  function done() {
    if( finished && count === writeCount ) {
      res.end('');
    }
  }

  result.stream.on('data', async function(item) {
      count++;
      line = [];

      if( includeMetadata ) {
        for( i = 0; i < metadataLength; i++ ) {
          line.push(item[result.metadata[i]] === undefined ? '' : item[result.metadata[i]]);
        }
      }

      for( i = 0; i < dataLength; i++ ) {
        line.push(item.datapoints[result.data[i]] === undefined ? '' : item.datapoints[result.data[i]]);
      }

      res.write(await csvStringify([line]));
      writeCount++;
      done();
  });

  result.stream.on('end', function() {
    finished = true;
    done();
  });
};