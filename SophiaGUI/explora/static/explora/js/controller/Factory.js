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
        },
        changeArticleCategory: function (id, category) {
            return $http({
                method: 'POST',
                url: '/articles/changeCategory/',
                data: $.param({ id: id, category: category })
            }).then(function (response) {
                return response;
            });
        },
        getStackBarData: function (data) {
            return $http({
                method: 'POST',
                url: '/articles/getStackBar/',
                data: $.param(data)
            }).then(function (response) {
                return response.data;
            })
        }
    };
});

app.factory('ExportData', function ($http) {
    return {
        save: function (data, opts) {
            var target = document.getElementById('spinner')
            var spinner = new Spinner(opts);
            spinner.spin(target);
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
                spinner.stop(target);
                saveAs(blob, response.headers()['file-name']);
            }, function errorCallback(response) {
                console.log("Error Callback");
            });
        },
        exportImage: function (format) {
            var svgString = new XMLSerializer().serializeToString(document.querySelector("#selectedHistogram"));
            svgImage = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            if (format == 'PNG') {
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                ctx.canvas.width = $('#selectedHistogram').width();
                ctx.canvas.height = $('#selectedHistogram').height();
                var DOMURL = window.URL || window.webkitURL || window;
                var img = new Image();
                var url = DOMURL.createObjectURL(svgImage);
                img.onload = function () {
                    ctx.drawImage(img, 0, 0);
                    DOMURL.revokeObjectURL(url);
                    var imgURI = canvas
                        .toDataURL('image/png')
                        .replace('image/png', 'image/octet-stream');
                    window.open(imgURI, "_self")
                };
                img.src = url;
            }
            if (format == 'SVG') {
                saveAs(svgImage, "exportImage.svg");
            }
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
        },
        getPressMediaGroups: function () {
            return $http({
                method: 'GET',
                url: '/pressmedia/getgroups/',
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

app.factory('NewsCases', function ($http) {
    return {
        updateNewsCase: function (data) {
            return $http({
                method: 'POST',
                url: '/updateNewsCase/',
                data: $.param({ data: JSON.stringify(data) })
            }).then(function successCallback(response) {
                return response;
            });
        },
        removeArticle: function (data) {
            return $http({
                method: 'POST',
                url: '/removeArticle/',
                data: $.param(data)
            }).then(function successCallback(response) {
                return response;
            });
        },
        getRemovedArticles: function (data) {
            return $http({
                method: 'POST',
                url: '/getNewsCaseInfo/',
                data: $.param(data)
            }).then(function (response) {
                return response;
            });
        },
        getNewsCaseInfo: function (data) {
            return $http({
                method: 'POST',
                url: '/getNewsCaseInfo/',
                data: $.param(data)
            }).then(function (response) {
                return response;
            });
        }
    }
});

app.factory('userRequest', function ($http) {
    return {
        sendAnalistRequest: function () {
            return $http({
                method: 'POST',
                url: '/requests/changeToAnalyst/'
            }).then(function (response) {
                return response;
            });
        },
        getRequestList: function () {
            return $http({
                method: 'GET',
                url: '/requests/getRequestList/'
            }).then(function (response) {
                return response;
            });
        },
        getAllowedRequestList: function () {
            return $http({
                method: 'GET',
                url: '/requests/getAllowedRequestList/'
            }).then(function (response) {
                return response;
            })
        },
        acceptAnalistRequest: function (username) {
            return $http({
                method: 'POST',
                url: '/requests/acceptAnalistRequest/',
                data: $.param({ username: username })
            }).then(function (response) {
                return response;
            });
        },
        rejectAnalistRequest: function (username) {
            return $http({
                method: 'POST',
                url: '/requests/rejectAnalistRequest/',
                data: $.param({ username: username })
            }).then(function (response) {
                return response;
            })
        },
        removePermission: function (username) {
            return $http({
                method: 'POST',
                url: '/requests/removePermission/',
                data: $.param({ username: username })
            }).then(function (response) {
                return response;
            })
        }
    }
})