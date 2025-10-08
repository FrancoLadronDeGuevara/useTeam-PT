import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { BoardProvider } from "./context/BoardContext";
import { ThemeProvider } from "./context/ThemeContext";
import BoardList from "./components/BoardList/BoardList";
import Board from "./components/Board/Board";
import Header from "./components/Header/Header";
import NavigationBar from "./components/Header/NavigationBar";

function App() {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  return (
    <ThemeProvider>
      <BoardProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <Header selectedBoardId={selectedBoardId} />

          <NavigationBar
            selectedBoardId={selectedBoardId}
            onBackToBoards={() => setSelectedBoardId(null)}
          />

          <main className="container mx-auto px-6 py-6">
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
    </ThemeProvider>
  );
}

export default App;
