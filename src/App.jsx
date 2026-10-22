import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Home from "./pages/Home";
import CreateMessage from "./pages/CreateMessage";
import ReadMessage from "./pages/ReadMessage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="ambient ambient-three" />

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/create"
            element={<CreateMessage />}
          />

          <Route
            path="/s/:id"
            element={<ReadMessage />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>

        <footer className="site-footer">
          VANISH • Privacy-first one-time messaging
        </footer>
      </div>
    </BrowserRouter>
  );
}