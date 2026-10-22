import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error) {
    if (!import.meta.env.PROD) {
      console.error(
        "[VANISH ERROR]",
        error
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "#070914",
            color: "white",
            textAlign: "center"
          }}
        >
          <div>
            <h1>
              Something went wrong.
            </h1>

            <p>
              Refresh the page and try again.
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                cursor: "pointer"
              }}
            >
              Reload
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}



ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
