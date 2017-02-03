app.controller('registrationController', ['$scope', '$http','dataFormat', function ($scope, $http, dataFormat) {

    var opts = dataFormat.loadSpinnerOPTS();

    $scope.username = "";
    $scope.firstname = "";
    $scope.lastname = "";
    $scope.email = "";
    $scope.password;
    $scope.confirmpassword;
    $scope.checkPasswords = true;
    $scope.checkMatchPasswords = true;
    $scope.checkUserExist = false;
    $scope.newUserCreated = false;
    $scope.validateForm = false;
    $scope.hideForm = false;

    $scope.validateFormInput = function () {
        if ($scope.checkPasswords == true && $scope.checkMatchPasswords == true) {
            $scope.validateForm = true;
        }
        else {
            $scope.validateForm = false;
        }
    }

    $scope.matchPasswords = function (password1, password2) {
        if (password1.localeCompare(password2) != 0) {
            $scope.checkMatchPasswords = false;
        }
        else {
            $scope.checkMatchPasswords = true;
        }
        $scope.validateFormInput();
    }

    $scope.lengthPasswords = function (password) {
        if (password.length < 8) {
            $scope.checkPasswords = false;
        }
        else {
            $scope.checkPasswords = true;
        }
        $scope.matchPasswords($scope.password, $scope.confirmpassword);
        $scope.validateFormInput();
    }

    $scope.getUserInput = function (valid) {
        if (valid == true) {
            console.log("Se enviará la data");
            data = {
                'username': $scope.username,
                'firstname': $scope.firstname,
                'lastname': $scope.lastname,
                'email': $scope.email,
                'password': $scope.password
            }

            var target = document.getElementById('spinner')
            var spinner = new Spinner(opts);
            spinner.spin(target);
            $http({
                method: 'POST',
                url: '/createaccount/createUser/',
                data: $.param({ data: JSON.stringify(data) })
            }).then(function (response) {
                if (response.data == 'user exists') {
                    $scope.newUserCreated = false;
                    $scope.checkUserExist = true;
                    spinner.stop(target);
                }
                else if (response.data == 'new user created') {
                    $scope.checkUserExist = false;
                    $scope.newUserCreated = true;
                    spinner.stop(target);
                    $scope.hideForm = true;
                }
                else {
                    console.log(response.data);
                    spinner.stop(target);
                }
            });
        }
    }

}]);