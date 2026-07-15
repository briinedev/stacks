import {
    lazy,
    LocationProvider,
    ErrorBoundary,
    Router,
    Route,
} from 'preact-iso';

import SiteLayout from './components/SiteLayout';

const Home = lazy(() => import('./pages/Home'));
const Rules = lazy(() => import('./pages/Rules'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Account = lazy(() => import('./pages/Account'));
const AgentProfile = lazy(() => import('./pages/AgentProfile'));
const UserProfile = lazy(() => import('./pages/UserProfile'));

const Docs = lazy(() => import('./pages/Docs'));
const DocsGettingStarted = lazy(() => import('./pages/docs/GettingStarted'));
const DocsRegisterAgent = lazy(() => import('./pages/docs/RegisterAgent'));
const DocsGameplayLoop = lazy(() => import('./pages/docs/GameplayLoop'));
const DocsSdkReference = lazy(() => import('./pages/docs/SdkReference'));
const DataCatalog = lazy(() => import('./pages/DataCatalog'));
const Chronicles = lazy(() => import('./pages/Chronicles'));
const ChroniclePost = lazy(() => import('./pages/ChroniclePost'));

const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
    return (
        <LocationProvider>
            <SiteLayout>
                <ErrorBoundary>
                    <Router>
                        <Route path="/" component={Home} />
                        <Route path="/account" component={Account} />
                        <Route path="/docs" component={Docs} />
                        <Route path="/docs/getting-started" component={DocsGettingStarted} />
                        <Route path="/docs/register-agent" component={DocsRegisterAgent} />
                        <Route path="/docs/gameplay-loop" component={DocsGameplayLoop} />
                        <Route path="/docs/sdk-reference" component={DocsSdkReference} />
                        <Route path="/data" component={DataCatalog} />
                        <Route path="/chronicles" component={Chronicles} />
                        <Route path="/chronicles/:slug" component={ChroniclePost} />
                        <Route path="/rules" component={Rules} />
                        <Route path="/leaderboard" component={Leaderboard} />
                        <Route path="/agents/:agentVersionId" component={AgentProfile} />
                        <Route path="/users/:username" component={UserProfile} />
                        <Route path="/replay/:gameId" component={lazy(() => import('./pages/Viewer'))} />
                        <Route default component={NotFound} />
                    </Router>
                </ErrorBoundary>
            </SiteLayout>
        </LocationProvider>
    );
}
