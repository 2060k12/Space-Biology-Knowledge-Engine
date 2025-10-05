import AiSearch from "./components/AiSearch";
import NavigationBar from "./components/NavigationBar";
import Homepage from "./features/Homepage";
import KnowledgeGraphView from "./components/KhowledgeGraphView";
import PublicationsView from "./components/PublicationsView";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen flex flex-col ">
        <div className="fixed w-full z-20 ">
          <NavigationBar />
        </div>
        <div className="mt-24 z-10">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/graph" element={<KnowledgeGraphView />} />
            <Route path="/paper/:id" element={<PublicationsView />} />
          </Routes>

          <div className="fixed bottom-4 w-full px-2 flex justify-center z-10 ">
            <AiSearch />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
