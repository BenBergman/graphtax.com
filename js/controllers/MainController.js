app.controller("MainController", ["$scope", "$uibModal", "$filter", "$http", function($scope, $uibModal, $filter, $http) {
    $http.jsonp("https://geoip.nekudo.com/api?callback=JSON_CALLBACK")
        .success(function(data, status, headers, config) {
            $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + data.location.latitude + "," + data.location.longitude + "&sensor=false")
                .success(function (res) {
                    for (var key in res.results) {
                        for (var component in res.results[key].address_components) {
                            for (var type in res.results[key].address_components[component].types) {
                                if (res.results[key].address_components[component].types[type] == "administrative_area_level_1") {
                                    $scope.usersRegion = res.results[key].address_components[component].long_name;
                                    if ($scope.regions.indexOf($scope.usersRegion) >= 0) {
                                        $scope.currentRegion = $scope.usersRegion;
                                    }
                                    return;
                                }
                            }
                        }
                    }
                    $scope.usersRegion = "no_region_match";
                    if ($scope.defaultRegion != null) {
                        $scope.currentRegion = $scope.defaultRegion;
                    }
                })
                .error(function() {
                    $scope.usersRegion = "geocode_error";
                    if ($scope.defaultRegion != null) {
                        $scope.currentRegion = $scope.defaultRegion;
                    }
                });
        })
        .error(function() {
            $scope.usersRegion = "geoip_error";
            if ($scope.defaultRegion != null) {
                $scope.currentRegion = $scope.defaultRegion;
            }
        });

    $http.get('data/canada_2016.json')
        .then(function(res) {
            for (var key in res.data) {
                $scope[key] = res.data[key];
            }
            if (["geoip_error", "geocode_error", "no_region_match"].indexOf($scope.usersRegion) >= 0) {
                $scope.currentRegion = $scope.defaultRegion;
            } else if ($scope.usersRegion == null) {
                // Give geoip a chance to match the user's region
            } else {
                $scope.currentRegion = $scope.usersRegion;
            }
        });

    $scope.min = 0;
    $scope.max = 50000;
    $scope.accordions = {
        earn: true,
        credits: false,
        breakdown: false,
    };
    $scope.$watch('accordions.credits', function() {
        $scope.calculateData();
        $scope.renderCreditsSlow();
    });
    $scope.$watch('accordions.breakdown', function() {
        $scope.toggleAreas($scope.accordions.breakdown);
    });
    $scope.sliders = {
        "creditRefundable": 0,
        "creditNonRefundable": 0,
        "deduction": 0,
    };

    $scope.currentIncome = 0;
    $scope.currentTax = 0;
    $scope.currentEff = 0;
    $scope.currentMarg = 0;

    $scope.currentFederalTax = 0;
    $scope.currentProvincialTax = 0;

    $scope.currentFederalMarg = 0;
    $scope.currentProvincialMarg = 0;

    $scope.currentFederalEff = 0;
    $scope.currentProvincialEff = 0;

    $scope.doneFirstRender = false;
    $scope.currentRegion = "Province";
    $scope.rawBrackets = {
        "Federal": {
            "income": [
                [Infinity, 0.0]
            ],
            "personalAmount": [
                [Infinity, 0.0]
            ]
        },
        "Province": {
            "abatement": 0.0,
            "income": [
                [Infinity, 0.0]
            ],
            "personalAmount": [
                [Infinity, 0.0]
            ]
        },
    };
    $scope.data = [];
    $scope.changeRegion = function(region) {
        $scope.currentRegion = region;
    };
    $scope.renderRegion = function() {
        $scope.calculateData();
        $scope.render();
    };
    $scope.changeCreditsAndDeductions = function() {
        $scope.calculateData();
        $scope.renderCredits();
    };
    $scope.$watch('currentRegion', $scope.renderRegion);
    $scope.$watch('sliders.creditRefundable', $scope.changeCreditsAndDeductions);
    $scope.$watch('sliders.creditNonRefundable', $scope.changeCreditsAndDeductions);
    $scope.$watch('sliders.deduction', $scope.changeCreditsAndDeductions);
    $scope.sliderFormat = function(value) {
        return $filter('currency')(value, '$', 0);
    };
    $scope.openDonate = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'templates/donate-modal.html',
            controller: 'ModalInstanceCtrl',
        });

        modalInstance.result.then(function(returnValue) {
            console.log('Returned: ' + returnValue);
        }, function() {
            console.log('Cancelled');
        })
    };
}]);
