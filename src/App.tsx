import {
  lazy,
  LocationProvider,
  ErrorBoundary,
  Router,
  Route,
} from 'preact-iso';

const Test = lazy(() => import('./components/Test'));

export default function App() {
  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Route path="/" component={Test} />
          <Route path="/test" component={Test} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}
