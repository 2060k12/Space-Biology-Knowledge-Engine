import AiSearch from "./components/AiSearch";
import NavigationBar from "./components/NavigationBar";
import Homepage from "./features/Homepage";

function App() {
  return (
    <>
      <div className="h-screen flex flex-col ">
        <div className="fixed w-full z-20 ">
          <NavigationBar />
        </div>
        <div className="mt-30 z-10">
          <Homepage />
          <div className="fixed bottom-4 w-full px-2 flex justify-center z-10 ">
            <AiSearch />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
