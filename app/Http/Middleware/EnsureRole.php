<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Allowed roles (e.g. secretary,admin).
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
     * @param  \Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $roles = ''): Response
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $userRole = User::normalizeRole($user->role);
        $allowed = array_merge(
            $this->roles,
            array_filter(array_map('trim', explode(',', $roles)))
        );
        $allowed = array_map(fn (string $r): ?string => User::normalizeRole($r), $allowed);
        if ($allowed !== [] && ! in_array($userRole, $allowed, true)) {
            abort(403);
        }

        return $next($request);
    }
}
