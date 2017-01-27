app.factory('Articles', function ($http) {
    return {
        getArticlesList: function (data, page) {
            return $http({
                method: 'POST',
                url: '/get_data/articles/articles_advance_search/' + page + '/',
                data: $.param({ data: JSON.stringify(data) })
            }).then(function (response) {
                return response.data;
            });
        },

        getArticlesCountBy: function (data) {
            return $http({
                method: 'POST',
                url: '/get_data/articles/histogram',
                data: $.param(data)
            }).then(function (response) {
                return response.data;
            });
        },
        createNewsCases: function (data) {
            return $http({
                method: 'POST',
                url: '/create/newsCase/',
                data: $.param({ data: JSON.stringify(data) })
            }).then(function (response) {
                return response;
            });
        }
    };
});

app.factory('ExportData', function ($http) {
    return {
        save: function (data) {
            $http({
                method: 'POST',
                url: '/exportData/',
                data: $.param({ data: JSON.stringify(data) })
            }).then(function successCallback(response, headers) {
                if (response.headers()['content-type'] == 'text/json') {
                    var blob = new Blob([JSON.stringify(response.data)], { type: response.headers()['content-type'] });
                }
                else {
                    var blob = new Blob([String(response.data)], { type: response.headers()['content-type'] });
                }
                saveAs(blob, response.headers()['file-name']);
            }, function errorCallback(response) {
                console.log("Error Callback");
            });
        }
    }
});

app.factory('PressMedia', function ($http) {
    return {
        getPressMediaList: function () {
            return $http({
                method: 'GET',
                url: '/pressmedia/getlist/',
            }).then(function (response) {
                return response;
            });
        }
    }
});

app.factory('Tweets', function ($http) {
    return {
        getTweetList: function (data, page) {
            return $http({
                method: 'POST',
                url: '/get_data/tweets/' + page + '/',
                data: $.param({ data: JSON.stringify(data) })
            }).then(function successCallback(response) {
                return response.data;
            });
        },
        getTweetsCountBy: function (data) {
            return $http({
                method: 'POST',
                url: '/get_data/tweets/histogram/',
                data: $.param(data)

            }).then(function successCallback(response) {
                return response
            });
        }
    }
});