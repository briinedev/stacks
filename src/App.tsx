import {
    lazy,
    LocationProvider,
    ErrorBoundary,
    Router,
    Route,
} from 'preact-iso';

const Home = lazy(() => import('./pages/Home'));
const Docs = lazy(() => import('./pages/Docs'));
const Rules = lazy(() => import('./pages/Rules'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/docs" component={Docs} />
                    <Route path="/rules" component={Rules} />
                    <Route default component={NotFound} />
                </Router>
            </ErrorBoundary>
        </LocationProvider>
    );
}
