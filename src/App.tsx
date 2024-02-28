import { useEffect, useRef, useState } from "react";
import "./App.css";
import { MpSdk, setupSdk } from "@matterport/sdk";

// "https://my.matterport.com/show?qs=1&m=j4RZx7ZGM6T&play=1&applicationKey=5kic6ie6efzhec229s1783usc"

function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function App() {
  const [sdk, setSdk] = useState<MpSdk>();
  const container = useRef<HTMLDivElement>(null);
  let started = false;

  const intersectionRef = useRef<any>();

  useEffect(() => {
    if (!started && container.current) {
      started = true;

      (async () => {
        const mpSdk = await setupSdk("5kic6ie6efzhec229s1783usc", {
          container: container.current!,
          space: "j4RZx7ZGM6T",
          iframeQueryParams: { qs: 1 },
        });

        await mpSdk.App.state.waitUntil(
          (state: any) => state.phase === mpSdk.App.Phase.PLAYING
        );

        mpSdk.Pointer.intersection.subscribe(function (intersection: any) {
          intersectionRef.current = intersection;
        });

        const modelData = await mpSdk.Model.getData();

        // Get random Sweep ID
        const randomID = getRandomInteger(0, modelData.sweeps.length);
        let { sid, rotation, floor } = modelData.sweeps[randomID];
        console.log(modelData, modelData.sweeps);

        // mpSdk.Camera.rotate(135, 0);

        if (floor) {
          await mpSdk.Sweep.moveTo(sid, {
            rotation: rotation,
            transition: mpSdk.Sweep.Transition.INSTANT,
            transitionTime: 2000,
          });
        }

        setSdk(mpSdk);
      })();
    }
  }, []);

  return (
    <div className="app">
      <div className="container" ref={container}></div>
    </div>
  );
}

export default App;
