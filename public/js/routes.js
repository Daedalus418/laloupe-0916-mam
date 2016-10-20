const routes = ($routeProvider, $httpProvider) => {

    $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'mainController',
            controllerAs: 'vm'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginController',
            controllerAs: 'vm'
        })
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'adminController',
            controllerAs: 'vm'
        })
        .when('/addActivity', {
            templateUrl: 'views/admin/addActivity.html',
            controller: 'addActivity',
            controllerAs: 'vm'
        })
        .when('/editActivite', {
            templateUrl: 'views/admin/editActivite.html',
            controller: 'editActivite',
            controllerAs: 'vm'
        })
        .when('/editInfoPratique', {
            templateUrl: 'views/admin/editInfoPratique.html',
            controller: 'editInfoPratique',
            controllerAs: 'vm'
        })
        .when('/editPartenaire', {
            templateUrl: 'views/admin/editPartenaire.html',
            controller: 'editPartenaire',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/'
        })

    $httpProvider.interceptors.push(($q, $location, $rootScope, $window, sessionFactory) => {
        return {
            request(config) {

                config.headers = config.headers || {};
                if ($window.localStorage.token) {
                    sessionFactory.token = $window.localStorage.token
                    sessionFactory.user = JSON.parse($window.localStorage.getItem('currentUser'));
                    config.headers.authorization = $window.localStorage.token
                }
                return config
            },
            responseError(response) {
                if (response.status === 401 || response.status === 403) {
                    $rootScope.$emit('loginStatusChanged', false);
                    //$location.path('/login');

                }
                return $q.reject(response)
            }
        }
    })

}

const loginStatus = ($rootScope, $window, sessionFactory) => {

    if ($window.localStorage.currentUser) {
        sessionFactory.user = JSON.parse($window.localStorage.getItem('currentUser'));
    }

    $rootScope.$on('loginStatusChanged', (event, isLogged) => {
        $window.localStorage.setItem('currentUser', JSON.stringify(sessionFactory.user));
        $window.localStorage.token = sessionFactory.token;
        sessionFactory.isLogged = isLogged;
    })

}

const checkIsConnected = ($q, $http, $location, $window, $rootScope) => {
    let deferred = $q.defer()

    $http.get('/api/loggedin').success(() => {
        $rootScope.$emit('loginStatusChanged', true);
        // Authenticated
        deferred.resolve()
    }).error(() => {
        $window.localStorage.removeItem('token');
        $window.localStorage.removeItem('currentUser');
        $rootScope.$emit('loginStatusChanged', false);
        // Not Authenticated
        deferred.reject()
        $location.url('/login')
    })

    return deferred.promise
}
