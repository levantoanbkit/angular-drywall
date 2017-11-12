angular.module('services.controlLogResource', []).factory('controlLogResource', ['$http', '$q', function ($http, $q) {
  // local variable
  var controlLogUrl = '/api/controlLogs';

  var processResponse = function(res){
    return res.data;
  };
  var processError = function(e){
    var msg = [];
    if(e.status)         { msg.push(e.status); }
    if(e.statusText)     { msg.push(e.statusText); }
    if(msg.length === 0) { msg.push('Unknown Server Error'); }
    return $q.reject(msg.join(' '));
  };
  // public api
  var resource = {};
  // ----- controlLog api -----
  resource.findControlLogs = function(filters){
    if(angular.equals({}, filters)){
      filters = undefined;
    }
    console.log('filters: ', filters);
    return $http.get(controlLogUrl, { params: filters }).then(processResponse, processError);
  };
  resource.addUControlLog = function(deviceId, username, command){
    return $http.post(controlLogUrl, { device: deviceId, username: username, command: command }).then(processResponse, processResponse);
  };
  
  resource.deleteControlLog = function(_id){
    var url = controlLogUrl + '/' + _id;
    return $http.delete(url).then(processResponse, processError);
  };

  return resource;
}]);
