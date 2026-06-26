import {
    lazy,
    LocationProvider,
    ErrorBoundary,
    Router,
    Route,
} from 'preact-iso';

const Home = lazy(() => import('./pages/Home'));

export default function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/test" component={() => <></>} />
                </Router>
            </ErrorBoundary>
        </LocationProvider>
    );
}
