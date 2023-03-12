const nodeRequest = require("request");

class RequestHelper {
    requestAttempts = 0;
    maxRetries = 10;
    retryDelay;
    retryLimit;
    options;
    onSuccess;
    onFailure;
    Log;

    constructor(options, onSuccess, onFailure) {
        this.options = options;
        this.Log = this.options.logger;
        this.retryDelay = this.options.retryDelay;
        this.retryLimit = this.options.retryLimit;

        this.onSuccess = onSuccess;
        this.onFailure = onFailure;

        this.makeRequest();
    }

    makeRequest = () => {
        this.requestAttempts++;
        const req = nodeRequest({
			url: this.options.url,
			method: this.options.method
		}, this.handleResponse);

        req.on('timeout', this.handleTimeout);
    }

    handleError = () => {
        if(requestAttempts < maxRetries) {
            this.Log.log('Retrying request in ' + this.retryDelay + 'ms... (' + this.requestAttempts + '/' + this.maxRetries + ')' );
            setTimeout(this.makeRequest, this.retryDelay);
        } else {
            this.Log.error('Max retries reached. Giving up.');
            this?.onFailure();
        }
    }

    handleResponse = (error, response, body) => {
        if (!error && response.statusCode == 200) {
            this?.onSuccess(body);
        } else {
            this.Log.log("STATUSERROR: " + response.statusCode);
            this.handleError();
        }
    }

    handleTimeout = () => {
        this.Log.error('Timeout occurred fetching data from ' + this.options.url);
        this.handleError();
    }
}

function request (options, onSuccess, onFailure) {
    new RequestHelper(options, onSuccess, onFailure);
}
  
module.exports = {
    request
};
  