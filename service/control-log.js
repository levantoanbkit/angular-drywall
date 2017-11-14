'use strict';
// public api
var controlLog = {
  find: function(req, res, next){
    req.query.device = req.query.device ? req.query.device : '';
    console.log('device find: ', req.query.device);
    // req.query.username = req.query.device ? req.query.device : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '-time';

    var filters = {};
    if (req.query.device) {
      filters.device = new RegExp('^.*?'+ req.query.device +'.*$', 'i');
    }

    // if (req.query.username) {
    //   filters.username = new RegExp('^.*?'+ req.query.username +'.*$', 'i');
    // }

    req.app.db.models.ControlLog.pagedFind({
      filters: filters,
      keys: 'device username time command',
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }, function(err, results) {
      if (err) {
        return next(err);
      }

      results.filters = req.query;
      res.status(200).json(results);
    });
  },

  // read: function(req, res, next){
  //   req.app.db.models.ControlLog.findById(req.params.id).exec(function(err, controlLog) {
  //     if (err) {
  //       return next(err);
  //     }
  //     res.status(200).json(controlLog);
  //   });
  // },

  create: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      // console.log('validate----:', req.user.roles.admin);
      // if (!req.user.roles.admin.isMemberOf('root')) {
      //   workflow.outcome.errors.push('You may not create controlLogs.');
      //   return workflow.emit('response');
      // }

      if (!req.body.device) {
        workflow.outcome.errors.push('A device is required.');
        return workflow.emit('response');
      }

      if (!req.body.username) {
        workflow.outcome.errors.push('An username is required.');
        return workflow.emit('response');
      }

      if (!req.body.command) {
        workflow.outcome.errors.push('An command is required.');
        return workflow.emit('response');
      }

      workflow.emit('duplicateControlLogCheck');
    });

    workflow.on('duplicateControlLogCheck', function() {
      req.app.db.models.ControlLog.findById(req.app.utility.slugify(req.body.device +' '+ req.body.username +' '+ Date.now())).exec(function(err, status) {
        if (err) {
          return workflow.emit('exception', err);
        }

        if (status) {
          workflow.outcome.errors.push('That status+pivot is already taken.');
          return workflow.emit('response');
        }

        workflow.emit('createControlLog');
      });
    });

    workflow.on('createControlLog', function() {
      var currentTime = Date.now();
      var fieldsToSet = {
        _id: req.app.utility.slugify(req.body.device +' '+ req.body.username +' '+ currentTime),
        device: req.body.device,
        username: req.body.username,
        time: currentTime,
        command: req.body.command
      };

      req.app.db.models.ControlLog.create(fieldsToSet, function(err, controlLog) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.outcome.record = controlLog;
        return workflow.emit('response');
      });
    });

    workflow.emit('validate');
  },

  delete: function(req, res, next){
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
      if (!req.user.roles.admin.isMemberOf('root')) {
        workflow.outcome.errors.push('You may not delete controlLogs.');
        return workflow.emit('response');
      }

      workflow.emit('deleteControlLog');
    });

    workflow.on('deleteControlLog', function(err) {
      req.app.db.models.ControlLog.findByIdAndRemove(req.params.id, function(err, controlLog) {
        if (err) {
          return workflow.emit('exception', err);
        }

        workflow.emit('response');
      });
    });

    workflow.emit('validate');
  }
};
module.exports = controlLog;