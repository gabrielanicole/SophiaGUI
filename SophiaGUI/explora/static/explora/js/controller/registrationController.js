app.controller('registrationController', ['$scope', '$http', function ($scope, $http) {

    $scope.username = "Matias";
    $scope.firstname = "Matias";
    $scope.lastname = "Aravena";
    $scope.email = "maravenag@live.cl";
    $scope.password ="password123";
    $scope.confirmpassword;
    $scope.checkPasswords = false;
    $scope.checkMatchPasswords = false;

    $scope.matchPasswords = function (password1, password2) {
        if (password1.localeCompare(password2) != 0) {
            $scope.checkMatchPasswords = true;
        }
        else {
            $scope.checkMatchPasswords = false;
        }
    }

    $scope.lengthPasswords = function (password) {
        if (password.length < 8) {
            $scope.checkPasswords = true;
        }
        else {
            $scope.checkPasswords = false;
        }
    }

    $scope.getUserInput = function () {
        data = {
            'username': $scope.username,
            'firstname': $scope.firstname,
            'lastname': $scope.lastname,
            'email': $scope.email,
            'password': $scope.password
        }

        $http({
            method: 'POST',
            url: '/createaccount/createUser/',
            data: $.param({ data: JSON.stringify(data) })
        }).then(function (response) {
            console.log(response);
        });
    }


}]);