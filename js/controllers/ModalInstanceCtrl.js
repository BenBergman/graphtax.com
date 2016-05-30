app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
  $scope.ok = function () {
    $uibModalInstance.close('Return value');
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
