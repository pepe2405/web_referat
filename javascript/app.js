// Файл: javascript/app.js
console.log("Файл app.js се зарежда...");

// Проверка дали AngularJS е зареден
if (typeof angular === 'undefined') {
    console.error("AngularJS НЕ Е зареден преди app.js.");
} else  {
    console.log("AngularJS е зареден преди app.js.");

    try {
        // *** ВЗИМАМЕ СЪЩЕСТВУВАЩИЯ МОДУЛ 'webRtcApp' ***
        // Използваме синтаксиса БЕЗ скоби [], за да го вземем.
        var app = angular.module('webRtcApp');
        console.log("Модул 'webRtcApp' е достъпен в app.js.");

        // *** ДЕФИНИРАМЕ КОНТРОЛЕРА ТУК ***
        app.controller('MainController', ['$scope', '$location', '$anchorScroll', '$window', '$timeout', 'cameraService', function($scope, $location, $anchorScroll, $window, $timeout, cameraService) {
            console.log("MainController се инициализира...");
            var vm = this;
            vm.currentDate = new Date();
            vm.activeSection = null;
            var scrollSpyTimeout = null;

            // ---- Инжектиране на cameraService ----
            vm.cameraService = cameraService;
            if (vm.cameraService) {
                console.log("CameraService е инжектиран успешно в MainController.", vm.cameraService);
            } else {
                console.error("ГРЕШКА: CameraService НЕ Е инжектиран в MainController.");
            }
            // ---------------------------------------------

            vm.setActive = function(sectionId) {
                 if (scrollSpyTimeout) {
                     $timeout.cancel(scrollSpyTimeout);
                     scrollSpyTimeout = null;
                 }
                vm.activeSection = sectionId;
                $location.hash(sectionId);
                $anchorScroll();
            };

            vm.isActive = function(sectionId) {
                return vm.activeSection === sectionId;
            };

            // --- Логика за АНИМАЦИЯ при скролване ---
            function initializeScrollAnimation() {
                 const sections = document.querySelectorAll('.section-fade-in');
                if (sections.length === 0) return;
                console.log("Инициализация на анимация при скролване...");
                const animationObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.animationPlayState = 'running';
                        }
                    });
                }, { threshold: 0.1 });
                 sections.forEach(section => {
                    section.style.animationPlayState = 'paused';
                    animationObserver.observe(section);
                });
                 $scope.$on('$destroy', function() {
                    if (animationObserver) animationObserver.disconnect();
                });
            }

            // --- Логика за АКТИВНА НАВИГАЦИЯ при скролване ---
            function initializeScrollSpy() {
                const sections = document.querySelectorAll('main section[id]');
                if (sections.length === 0) return;
                console.log("Инициализация на scroll spy...");
                const scrollSpyObserver = new IntersectionObserver((entries) => {
                    let currentActiveSectionId = vm.activeSection;
                    let intersectingEntries = entries.filter(entry => entry.isIntersecting);

                    if (intersectingEntries.length > 0) {
                        intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                        currentActiveSectionId = intersectingEntries[0].target.id;
                    } else {
                        const sectionsAboveMiddle = Array.from(sections).filter(section => {
                            return section.getBoundingClientRect().top < $window.innerHeight / 2;
                        });
                        if (sectionsAboveMiddle.length > 0) {
                            currentActiveSectionId = sectionsAboveMiddle[sectionsAboveMiddle.length - 1].id;
                        }
                    }

                     if ($window.scrollY <= 5) {
                         currentActiveSectionId = sections[0].id;
                     } else if ($window.innerHeight + $window.scrollY >= document.body.offsetHeight - 5) {
                         currentActiveSectionId = sections[sections.length - 1].id;
                     }

                    if (vm.activeSection !== currentActiveSectionId && currentActiveSectionId !== null) {
                        if (scrollSpyTimeout) {
                            $timeout.cancel(scrollSpyTimeout);
                        }
                        scrollSpyTimeout = $timeout(function() {
                            vm.activeSection = currentActiveSectionId;
                            scrollSpyTimeout = null;
                        }, 50);
                    }
                }, {
                    rootMargin: "-50% 0px -50% 0px"
                });
                 sections.forEach(section => {
                    scrollSpyObserver.observe(section);
                });
                 $timeout(function() {
                    if (!vm.activeSection && sections.length > 0) {
                        const initialVisible = Array.from(sections).find(section => section.getBoundingClientRect().top < $window.innerHeight / 2);
                        vm.activeSection = initialVisible ? initialVisible.id : sections[0].id;
                        console.log("Начална активна секция:", vm.activeSection);
                    }
                }, 150);
                 $scope.$on('$destroy', function() {
                    if (scrollSpyObserver) scrollSpyObserver.disconnect();
                    if (scrollSpyTimeout) $timeout.cancel(scrollSpyTimeout);
                });
            }

            // Извикване на инициализиращите функции
            angular.element($window).on('load', function() {
               console.log("Window заредено. Извикване на initializeScrollAnimation и initializeScrollSpy...");
               initializeScrollAnimation();
               initializeScrollSpy();
            });

            // Почистване при унищожаване на контролера
            $scope.$on('$destroy', function() {
                console.log("MainController destroyed. Спиране на камерата (ако е активна) чрез service.");
                if(vm.cameraService && typeof vm.cameraService.stopCamera === 'function') {
                    vm.cameraService.stopCamera();
                }
            });

            console.log("MainController е инициализиран успешно.");

        }]); // Край на MainController

    } catch (e) {
        // Тази грешка не би трябвало да се случва, ако camera-demo.js е зареден първи
        console.error("Грешка при достъп до модула 'webRtcApp' в app.js:", e);
    }

}