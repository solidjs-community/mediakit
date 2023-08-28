import { createMemo } from "solid-js";
import { createOpenGraphImage } from "@solid-mediakit/dynamic-image/server";
import server$ from "solid-start/server";
const DynamicImage0 = (props)=>{
    const img = server$(()=>{
        return createOpenGraphImage(async ()=>{
            const yes = 123;
            return <div>{yes}</div>;
        });
    });
    const url = createMemo(()=>{
        return img.url + `?args=${encodeURIComponent(JSON.stringify(props.values))}`;
    });
    return <>{url()}</>;
};
const coolVar = <DynamicImage0 values={[]}/>;
