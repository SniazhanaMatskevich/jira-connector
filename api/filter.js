"use strict";

module.exports = FilterClient;

/**
 * Used to access Jira REST endpoints in '/rest/api/2/filter'
 *
 * @param {JiraClient} jiraClient
 * @constructor FilterClient
 */
function FilterClient(jiraClient) {
    this.jiraClient = jiraClient;

    /**
     * Creates a new filter, and returns newly created filter. Currently sets permissions just using the users default
     * sharing permissions
     *
     * @method createFilter
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to the Jira API
     * @param {Array} [opts.expand] The parameters to expand.
     * @param {Object} opts.filter The filter to create.  See
     *      {@link https://docs.atlassian.com/jira/REST/latest/#d2e3347}
     * @param callback Called when the filter has been created.
     */
    this.createFilter = function (opts, callback) {
        var options = {
            uri: this.jiraClient.buildURL('/filter'),
            method: 'POST',
            json: true,
            followAllRedirects: true,
            qs: {},
            body: opts.filter
        };

        if (opts.expand) {
            options.qs.expand = '';
            opts.expand.forEach(function (ex) {
                options.qs.expand += ex + ','
            });
        }

        this.jiraClient.makeRequest(options, callback);
    };

    /**
     * Returns a filter given an id
     *
     * @method getFilter
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to the Jira API
     * @param {number} opts.filterId The ID of the filter to retrieve
     * @param callback Called when the filter has been retrieved.
     */
    this.getFilter = function (opts, callback) {
        var options = this.buildRequestOptions(opts, '', 'GET');
        this.jiraClient.makeRequest(options, callback);
    };

    /**
     * Updates an existing filter, and returns its new value.
     *
     * @method updateFilter
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to the Jira API
     * @param {number} opts.filterId The ID of the filter to update
     * @param {Object} opts.filter The new data for the filter.  See
     *      {@link https://docs.atlassian.com/jira/REST/latest/#d2e3401}
     * @param callback Called when the filter has been updated.
     */
    this.updateFilter = function (opts, callback) {
        var options = this.buildRequestOptions(opts, '', 'PUT', opts.filter);
        this.jiraClient.makeRequest(options, callback);
    };

    /**
     * Returns the default columns for the given filter. Currently logged in user will be used as the user making such
     * request.
     *
     * @method getFilterColumns
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to the Jira API
     * @param {number} opts.filterId The ID of the filter for which to retrieve columns.
     * @param callback Called when the columns have been retrieved.
     */
    this.getFilterColumns = function (opts, callback) {
        var options = this.buildRequestOptions(opts, '/columns', 'GET');
        this.jiraClient.makeRequest(options, callback);
    };

    /**
     * Sets the default columns for the given filter
     *
     * @method setFilterColumns
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to the Jira API
     * @param {number} opts.filterId The ID of the filter for which to update columns.
     * @param {Array} opts.columns The names of the new columns.
     *      See {@link https://docs.atlassian.com/jira/REST/latest/#d2e3460}
     * @param callback Called when the columns have been set
     */
    this.setFilterColumns = function (opts, callback) {
        var body = {columns: opts.columns};
        var options = this.buildRequestOptions(opts, '/columns', 'PUT', body);
        this.jiraClient.makeRequest(options, callback, 'Columns Updated');
    };

    /**
     * Resets the columns for the given filter such that the filter no longer has its own column config.
     *
     * @method resetFilterColumns
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to the Jira API
     * @param {number} opts.filterId The ID of the filter for which to reset columns.
     * @param callback Called when the columns have been reset.
     */
    this.resetFilterColumns = function (opts, callback) {
        var options = this.buildRequestOptions(opts, '/columns', 'DELETE');
        this.jiraClient.makeRequest(options, callback, 'Columns Reset');
    };

    /**
     * Returns the default share scope of the logged-in user.
     *
     * @param opts Ignored.
     * @param callback Called when the default share scope has been retrieved.
     */
    this.getDefaultShareScore = function (opts, callback) {
        var options = {
            uri: this.jiraClient.buildURL('/filter/defaultShareScope'),
            method: 'GET',
            json: true,
            followAllRedirects: true
        };

        this.jiraClient.makeRequest(options, callback);
    };

    /**
     * Sets the default share scope of the logged-in user.
     *
     * @method setDefaultShareScope
     * @memberOf {FilterClient#}
     * @param {Object} opts The request options sent to jira
     * @param {string} opts.scope The new default share scope. Available values are GLOBAL and PRIVATE.
     * @param callback Called when the default share scope has been set.
     */
    this.setDefaultShareScope = function (opts, callback) {
        var options = {
            uri: this.jiraClient.buildURL('/filter/defaultShareScope'),
            method: 'PUT',
            json: true,
            followAllRedirects: true,
            body: {
                scope: opts.scope
            }
        };
        this.jiraClient.makeRequest(options, callback);
    };

    /**
     * Build out the request options necessary to make a particular API call.
     *
     * @private
     * @method buildRequestOptions
     * @memberOf {FilterClient#}
     * @param {Object} opts The arguments passed to the method.
     * @param {number} opts.filterId The ID of the filter to use in the path.
     * @param {Array} [opts.fields] The fields to include
     * @param {Array} [opts.expand] The fields to expand
     * @param {string} path The path of the endpoint following /filter/{id}
     * @param {string} method The request method.
     * @param {Object} [body] The request body, if any.
     * @param {Object} [qs] The querystring, if any.  opts.expand and opts.fields arrays will be automagically added.
     * @returns {{uri: string, method: string, body: Object, qs: Object, followAllRedirects: boolean, json: boolean}}
     */
    this.buildRequestOptions = function (opts, path, method, body, qs) {
        var basePath = '/filter/' + opts.filterId;
        if (!qs) qs = {};
        if (!body) body = {};

        if (opts.fields) {
            qs.fields = '';
            opts.fields.forEach(function (field) {
                qs.fields += field + ','
            });
            qs.fields = qs.fields.slice(0, -1);
        }

        if (opts.expand) {
            qs.expand = '';
            opts.expand.forEach(function (ex) {
                qs.expand += ex + ','
            });
            qs.expand = qs.expand.slice(0, -1);
        }

        return {
            uri: this.jiraClient.buildURL(basePath + path),
            method: method,
            body: body,
            qs: qs,
            followAllRedirects: true,
            json: true
        };
    };
}