import { Link, useLocation } from 'react-router-dom';
import { firebaseApi } from '@/api/firebaseClient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Compass, Home } from 'lucide-react';


export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await firebaseApi.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-2xl w-full border border-border/60 bg-card/80 p-8 md:p-10 shadow-[0_24px_80px_-44px_rgba(0,0,0,0.45)]">
                <div className="space-y-8 text-center">
                    <div className="space-y-3">
                        <p className="text-xs uppercase tracking-[0.28em] text-primary">Archive Route Missing</p>
                        <h1 className="text-7xl font-display font-light text-muted-foreground/30">404</h1>
                        <div className="h-px w-20 bg-primary/30 mx-auto"></div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-display font-medium text-foreground">
                            Page Not Found
                        </h2>
                        <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                            The page <span className="font-medium text-foreground">"{pageName || '/'}"</span> could not be found in this archive. Try returning home or exploring another public section.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Link to="/" className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/35">
                            <Home className="w-4 h-4 text-primary" />
                            Go Home
                        </Link>
                        <Link to="/search" className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/35">
                            <Compass className="w-4 h-4 text-primary" />
                            Search Archive
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm text-foreground hover:border-primary/35"
                        >
                            <ArrowLeft className="w-4 h-4 text-primary" />
                            Go Back
                        </button>
                    </div>

                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="border border-primary/20 bg-primary/8 p-5 text-left">
                            <p className="text-sm font-medium text-foreground">Admin note</p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                If this route should exist, add the page, route, or redirect before deployment so visitors do not hit a dead end.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
