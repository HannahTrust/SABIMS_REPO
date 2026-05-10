<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Allowed roles (e.g. sb_secretary,admin).
     *
     * @var array<int, string>
     */
    protected array $roles = [];

    /**
     * @param  array<int, string>  $roles
     */
    public function __construct(array $roles = [])
    {
        $this->roles = $roles;
    }

    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles = ''): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $userRole = User::normalizeRole($user->role ?? '');
        if ($userRole === 'super_admin') {
            return $next($request);
        }

        $rawAllowed = array_merge(
            $this->roles,
            array_filter(array_map('trim', explode(',', $roles)))
        );
        $allowed = array_values(array_filter(array_map(
            function ($r) {
                $n = User::normalizeRole(is_string($r) ? $r : '');

                return $n !== null && $n !== '' ? $n : null;
            },
            $rawAllowed
        )));

        if ($allowed !== [] && ($userRole === null || $userRole === '' || ! in_array($userRole, $allowed, true))) {
            abort(403);
        }

        return $next($request);
    }
}
