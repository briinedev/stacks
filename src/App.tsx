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
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const AgentProfile = lazy(() => import('./pages/AgentProfile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
    return (
        <LocationProvider>
            <ErrorBoundary>
                <Router>
                    <Route path="/" component={Home} />
                    <Route path="/docs" component={Docs} />
                    <Route path="/rules" component={Rules} />
                    <Route path="/leaderboard" component={Leaderboard} />
                    <Route path="/agents/:agentVersionId" component={AgentProfile} />
                    <Route path="/users/:username" component={UserProfile} />
                    <Route path="/replay/:gameId" component={lazy(() => import('./pages/Viewer'))} />
                    <Route default component={NotFound} />
                </Router>
            </ErrorBoundary>
        </LocationProvider>
    );
}
