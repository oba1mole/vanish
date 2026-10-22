import { Link } from "react-router-dom";
import MessageComposer from "../components/MessageComposer";

export default function CreateMessage() {
  return (
    <main className="page-shell">
      <div className="top-navigation">
        <Link
          to="/"
          className="brand-link"
        >
          ◇ VANISH
        </Link>
      </div>

      <MessageComposer />
    </main>
  );
}