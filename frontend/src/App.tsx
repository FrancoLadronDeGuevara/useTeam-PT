import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { BoardProvider } from "./context/BoardContext";
import BoardList from "./components/BoardList/BoardList";
import Board from "./components/Board/Board";
import Header from "./components/Header/Header";

function App() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  return (
    <BoardProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header
          selectedBoardId={selectedBoardId}
          onBackToBoards={() => setSelectedBoardId(null)}
        />

        <main className="container mx-auto px-4 py-6">
          {!selectedBoardId ? (
            <BoardList onSelectBoard={setSelectedBoardId} />
          ) : (
            <Board boardId={selectedBoardId} />
          )}
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </BoardProvider>
  );
}

export default App;
