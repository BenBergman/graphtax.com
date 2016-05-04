app.controller("MainController", ["$scope", function($scope) {
    $scope.rawBrackets = {
        "Federal": {
            "income": [
                [45282, 0.1500],
                [90563, 0.2050],
                [140388, 0.2600],
                [200000, 0.2900],
                [Infinity, 0.3300]
            ],
            "personalAmount": [
                [11474, 0.1500]
            ]
        },
        "Manitoba": {
            "income": [
                [31000, 0.1080],
                [67000, 0.1275],
                [Infinity, 0.1740]
            ],
            "personalAmount": [
                [9134, 0.1080]
            ]
        },
        "Ontario": {
            "income": [
                [41536, 0.0505],
                [83075, 0.0915],
                [150000, 0.1116],
                [220000, 0.1216],
                [Infinity, 0.1316]
            ],
            "personalAmount": [
                [10011, 0.0505]
            ]
        }
    };
    $scope.data = [];
    $scope.changeProvince = function() {
        var brackets = add_brackets($scope.rawBrackets.Ontario.income, $scope.rawBrackets.Federal.income);
        brackets = subtract_brackets(brackets, $scope.rawBrackets.Ontario.personalAmount);
        brackets = subtract_brackets(brackets, $scope.rawBrackets.Federal.personalAmount);


        $scope.data = [];

        for (var i = 0; i <= 250000; i += 100) {
            $scope.data.push({
                "Income": i,
                "Tax": taxes_owed(i, brackets),
                "Effective Rate": effective_rate(i, brackets),
                "Marginal Rate": marginal_rate(i, brackets)
            });
        }
    };
}]);
