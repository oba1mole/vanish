import { Link, useParams } from "react-router-dom";
import MessageViewer from "../components/MessageViewer";

export default function ReadMessage() {
  const { id } = useParams();

  /*
   * The encryption key is deliberately kept
   * in the URL fragment.
   *
   * Example:
   *
   * /s/UUID#ENCRYPTION_KEY
   */
  const decryptionKey =
    window.location.hash.substring(1);

  return (
    <>
      <div className="top-navigation">
        <Link
          to="/"
          className="brand-link"
        >
          ◇ VANISH
        </Link>
      </div>

      <MessageViewer
        messageId={id}
        decryptionKey={decryptionKey}
      />
    </>
  );
}