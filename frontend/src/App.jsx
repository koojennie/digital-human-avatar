import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* PANEL KIRI: AVATAR 3D */}
      {/* <div className="relative w-1/2 h-full"> */}
        <Loader />
        <Leva collapsed />
        <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
          <Scenario />
        </Canvas>
      {/* </div> */}

      {/* PANEL KANAN: UI CHAT */}
      {/* <div className="w-1/2 h-full relative overflow-hidden border-l border-white/10">
        <ChatPage />
      </div> */}
      <ChatInterface />
    </div>
  );
}

export default App;
