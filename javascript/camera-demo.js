// Файл: javascript/camera-demo.js
console.log("Файл camera-demo.js се зарежда...");

// Проверка дали AngularJS е зареден
if (typeof angular !== 'undefined') {
    console.log("AngularJS е зареден преди camera-demo.js.");

    try {
        // *** ДЕФИНИРАМЕ МОДУЛА ТУК ***
        // Използваме синтаксиса със скоби [], за да го създадем.
        var app = angular.module('webRtcApp', []);
        console.log("Модул 'webRtcApp' дефиниран в camera-demo.js.");

        // *** СЕГА ДЕФИНИРАМЕ СЕРВИЗА В СЪЩИЯ ФАЙЛ ***
        app.service('cameraService', ['$timeout', '$q', function($timeout, $q) {
            console.log("CameraService се инициализира...");
            var service = this;

            service.status = 'Натиснете "Старт Камера", за да тествате.';
            service.stream = null;
            service.videoElementId = 'userVideoDemo';

            service.isCameraActive = function() {
                return service.stream !== null;
            };

            service.startCamera = function() {
                console.log("Извикване на cameraService.startCamera()...");
                var deferred = $q.defer();

                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    service.status = 'Грешка: getUserMedia не се поддържа от този браузър.';
                    console.error(service.status);
                    $timeout(function() { deferred.reject(service.status); });
                    return deferred.promise;
                }

                if (service.stream) {
                    console.log("Спиране на предишен поток преди стартиране на нов.");
                    service.stopCamera();
                }

                service.status = 'Искане на разрешение за достъп до камера...';
                $timeout(function() {});

                navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                    .then(function(stream) {
                        console.log("getUserMedia успешен. Поток получен:", stream);
                        service.stream = stream;
                        const videoElement = document.getElementById(service.videoElementId);
                        if (videoElement) {
                            console.log("Намерен видео елемент:", videoElement);
                            videoElement.srcObject = stream;
                        } else {
                            console.warn("Видео елемент с ID '" + service.videoElementId + "' не е намерен.");
                        }
                        service.status = 'Камерата е активна.';
                        $timeout(function() {
                            console.log("Promise-ът на startCamera е разрешен (resolved).");
                            deferred.resolve(stream);
                        });
                    })
                    .catch(function(error) {
                        console.error('Грешка при getUserMedia:', error.name, error.message);
                        service.stream = null;
                        let errorMessage = 'Грешка: Възникна неочаквана грешка при достъп до камерата.';
                        // ... (обработка на различните типове грешки) ...
                         if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                            errorMessage = 'Грешка: Достъпът до камерата беше отказан.';
                        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                            errorMessage = 'Грешка: Не е намерена камера.';
                        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                             errorMessage = 'Грешка: Камерата се използва от друго приложение или има хардуерен проблем.';
                        } else if (error.name === 'AbortError') {
                            errorMessage = 'Грешка: Заявката беше прекратена.';
                        } else if (error.name === 'SecurityError') {
                            errorMessage = 'Грешка: Проблем със сигурността (вероятно липса на HTTPS?).';
                        } else if (error.name === 'TypeError') {
                             errorMessage = 'Грешка: Неправилни constraints (напр. искане само на аудио, а няма микрофон).';
                        }
                        service.status = errorMessage;
                        console.error("Статусът е променен на:", errorMessage);
                        $timeout(function() {
                             console.log("Promise-ът на startCamera е отхвърлен (rejected).");
                            deferred.reject(errorMessage);
                        });
                    });
                return deferred.promise;
            };

            service.stopCamera = function() {
                console.log("Извикване на cameraService.stopCamera()...");
                if (service.stream) {
                    service.stream.getTracks().forEach(function(track) {
                        console.log("Спиране на трак:", track.kind, track.label);
                        track.stop();
                    });
                    service.stream = null;
                    service.status = 'Камерата е спряна. Натиснете "Старт Камера", за да тествате отново.';
                    console.log("Камерата е спряна.");
                     const videoElement = document.getElementById(service.videoElementId);
                     if (videoElement) {
                        videoElement.srcObject = null;
                     }
                    $timeout(function() {});
                } else {
                    console.log("Няма активен поток за спиране.");
                }
            };
            console.log("CameraService е инициализиран успешно.");
        }]); // Край на cameraService

    } catch (e) {
        console.error("Грешка при дефиниране на модула 'webRtcApp' или 'cameraService':", e);
    }

} else {
     console.error("AngularJS НЕ Е зареден преди camera-demo.js.");
}
