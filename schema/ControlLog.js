'use strict';

exports = module.exports = function(app, mongoose) {
  var controlLogSchema = new mongoose.Schema({
    _id: { type: String },
    device: { type: String, default: '' },
    username: { type: String, default: '' },
    time: { type: Date, default: Date.now },
    command: { type: String, default: '' }
  });
  controlLogSchema.plugin(require('./plugins/pagedFind'));
  controlLogSchema.index({ device: 1 });
  controlLogSchema.index({ username: 1 });
  controlLogSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('ControlLog', controlLogSchema);
};
