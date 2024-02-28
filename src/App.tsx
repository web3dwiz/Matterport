import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { MpSdk, setupSdk } from "@matterport/sdk";

function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function App() {
  const [sdk, setSdk] = useState<MpSdk>();

  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  let started = false;

  const [store] = useState<{
    intersection?: MpSdk.Pointer.Intersection;
    modelData?: MpSdk.Model.ModelData;
    floorData?: string[][];
  }>({});

  useEffect(() => {
    if (!started && containerRef.current) {
      started = true;

      (async () => {
        const mpSdk: MpSdk = await setupSdk("5kic6ie6efzhec229s1783usc", {
          container: containerRef.current!,
          space: "j4RZx7ZGM6T",
          iframeQueryParams: { qs: 1 },
        });

        await mpSdk.App.state.waitUntil(
          (state: any) => state.phase === mpSdk.App.Phase.PLAYING
        );

        // Get the intersection point
        mpSdk.Pointer.intersection.subscribe(function (
          intersection: MpSdk.Pointer.Intersection
        ) {
          store.intersection = intersection;
        });

        const modelData = await mpSdk.Model.getData();

        const floorData: string[][] = [];

        modelData.sweeps.forEach(({ floor, sid }: MpSdk.Sweep.SweepData) => {
          if (!floorData[floor]) floorData[floor] = [];
          floorData[floor].push(sid);
        });

        store.modelData = modelData;
        store.floorData = floorData;

        setSdk(mpSdk);
      })();
    }
  }, [store, setSdk]);

  const mouseDownHandler = useCallback(() => {
    overlayRef.current!.style.pointerEvents = "none";

    const timer = window.setTimeout(() => {
      overlayRef.current!.style.pointerEvents = "auto";

      const { modelData, intersection, floorData } = store;

      console.log(store);

      if (!sdk || !intersection || !modelData || !floorData) return;

      const { floorId } = intersection;

      if (!floorId) return;

      // Get random Sweep ID
      const randomID = getRandomInteger(0, floorData[floorId!].length);
      const sid = floorData[floorId!][randomID];

      // Move Camera to The Random Sweep
      sdk!.Sweep.moveTo(sid, {
        transition: sdk.Sweep.Transition.INSTANT,
        transitionTime: 1000,
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [sdk, store]);

  return (
    <div className="app">
      <div className="container" ref={containerRef}>
        <div
          ref={overlayRef}
          className="overlay"
          onPointerDown={mouseDownHandler}
        />
      </div>
    </div>
  );
}

export default App;
