app.controller("MainController", ["$scope", "$filter", function($scope, $filter) {
    $scope.min = 0;
    $scope.max = 100000;
    $scope.accordions = {
        earn: false,
        credits: false,
        breakdown: true
    };
    $scope.$watch('accordions.earn', function() { console.log('wut wut!'); });
    $scope.sliders = {
        "creditRefundable": 0,
        "creditNonRefundable": 0,
        "deduction": 0,
    };
    $scope.currentIncome = 0;
    $scope.currentTax = 0;
    $scope.currentEff = 0;
    $scope.currentMarg = 0;
    $scope.currentProvince = "Manitoba";
    $scope.provinces = [
        "Alberta",
        "British Columbia",
        "Manitoba",
        "New Brunswick",
        "Newfoundland & Labrador",
        "Northwest Territories",
        "Nova Scotia",
        "Nunavut",
        "Ontario",
        "Prince Edward Island",
        "Quebec",
        "Saskatchewan",
        "Yukon",
    ];
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
        "Alberta": {
            "income": [
                [125000, 0.10],
                [150000, 0.12],
                [200000, 0.13],
                [300000, 0.14],
                [Infinity, 0.15],
            ],
            "personalAmount": [
                [18451, 0.10]
            ]
        },
        "British Columbia": {
            "income": [
                [38210, 0.0506],
                [76421, 0.0770],
                [87741, 0.1050],
                [106543, 0.1229],
                [Infinity, 0.1470]
            ],
            "personalAmount": [
                [10027, 0.0506]
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
        },
        "Quebec": {
            "income": [
                [42390, 0.1600],
                [84780, 0.2000],
                [103150, 0.2400],
                [Infinity, 0.2575]
            ],
            "personalAmount": [
                // TODO: Why is the rate higher than the income bracket...? Is this related to the Fed amount scaling?
                [11550, 0.20]
            ]
        },
        "Saskatchewan": {
            "income": [
                [44601, 0.11],
                [127430, 0.13],
                [Infinity, 0.15]
            ],
            "personalAmount": [
                [15843, 0.11]
            ]
        },
        "New Brunswick": {
            "income": [
                [40492, 0.0968],
                [80985, 0.1482],
                [131664, 0.1652],
                [150000, 0.1784],
                [Infinity, 0.2030]
            ],
            "personalAmount": [
                [9758, 0.0968]
            ]
        },
        "Newfoundland & Labrador": {
            "income": [
                [35148, 0.0820],
                [70295, 0.1350],
                [125500, 0.1455],
                [175700, 0.1580],
                [Infinity, 0.1680]
            ],
            "personalAmount": [
                [8802, 0.0820]
            ]
        },
        "Nova Scotia": {
            "income": [
                [29590, 0.0879],
                [59180, 0.1495],
                [93000, 0.1667],
                [150000, 0.1750],
                [Infinity, 0.2100]
            ],
            "personalAmount": [
                [8481, 0.0879]
            ]
        },
        "Prince Edward Island": {
            "income": [
                [31984, 0.098],
                [63969, 0.138],
                [Infinity, 0.167]
            ],
            "personalAmount": [
                [7708, 0.098]
            ]
        },
        "Northwest Territories": {
            "income": [
                [41011, 0.0590],
                [82024, 0.0860],
                [133353, 0.1220],
                [Infinity, 0.1405]
            ],
            "personalAmount": [
                [14081, 0.0590]
            ]
        },
        "Nunavut": {
            "income": [
                [43176, 0.040],
                [86351, 0.070],
                [140388, 0.090],
                [Infinity, 0.115]
            ],
            "personalAmount": [
                [12947, 0.04]
            ]
        },
        "Yukon": {
            "income": [
                [45282, 0.064],
                [90563, 0.090],
                [140388, 0.109],
                [500000, 0.128],
                [Infinity, 0.150]
            ],
            "personalAmount": [
                [11474, 0.064]
            ]
        }
    };
    $scope.data = [];
    $scope.changeProvince = function(province) {
        $scope.currentProvince = province;
        $scope.calculateData();
        $scope.render();
    };
    $scope.changeCreditsAndDeductions = function() {
        $scope.calculateData();
        $scope.renderCredits();
    };
    $scope.$watch('sliders.creditRefundable', $scope.changeCreditsAndDeductions);
    $scope.$watch('sliders.creditNonRefundable', $scope.changeCreditsAndDeductions);
    $scope.$watch('sliders.deduction', $scope.changeCreditsAndDeductions);
    $scope.sliderFormat = function(value) {
        return $filter('currency')(value, '$', 0);
    }
}]);
