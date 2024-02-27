import { useEffect, useRef, useState } from "react";
import "./App.css";
import { MpSdk, setupSdk } from "@matterport/sdk";

function App() {
  const [sdk, setSdk] = useState<MpSdk>();
  const [horizontal, setHorizontal] = useState(45);
  const [vertical, setVertical] = useState(15);
  const container = useRef<HTMLDivElement>(null);
  let started = false;

  useEffect(() => {
    if (!started && container.current) {
      started = true;
      setupSdk("5kic6ie6efzhec229s1783usc", {
        container: container.current,
        space: "j4RZx7ZGM6T",
        iframeQueryParams: { qs: 1 },
      }).then((mpSDK: MpSdk) => {
        setSdk(mpSDK);
      });
    }
  }, []);

  return (
    <div className="app">
      <div className="container" ref={container}></div>
    </div>
  );
}

export default App;
