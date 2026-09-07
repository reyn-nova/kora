<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead

        <script>
            // Apply dark mode immediately to prevent flash of wrong theme
            (function() {
                var token = localStorage.getItem('token');
                if (token) {
                    fetch('/api/user', {
                        headers: {
                            'Authorization': 'Bearer ' + token,
                            'Accept': 'application/json',
                        },
                    })
                    .then(function(res) { return res.json(); })
                    .then(function(user) {
                        if (user && user.dark_mode) {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                        }
                    })
                    .catch(function() {
                        document.documentElement.classList.add('dark');
                    });
                } else {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
