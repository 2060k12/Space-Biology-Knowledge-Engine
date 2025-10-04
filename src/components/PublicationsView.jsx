import { RiCloseFill } from "@remixicon/react";

const PublicationsView = (props) => {
  return (
    <div className="w-4/5 h-4/5 bg-gray-400 rounded-3xl p-8 ">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl mb-5">
          {props.paper.name || "Lorem ipsum dolor"}
        </h1>
        <div
          onClick={() => props.close(false)}
          className="bg-red-400 rounded-[50%] p-2 cursor-pointer mb-5"
        >
          <RiCloseFill color="white" />
        </div>
      </div>
      <div className="bg-gray-300 border-1 border-gray-400 p-4 rounded-2xl">
        <h3>Aurthor : {props.paper.author || "Lorem ipsum dolor"}</h3>
        <h3>Year : {props.paper.year || "Lorem ipsum dolor"}</h3>
        <h3>Topics : {props.paper.topic || "Lorem ipsum dolor"}</h3>
        <h3>Organisms : {props.paper.organism || "Lorem ipsum dolor"}</h3>
        <h3>Citations : {props.paper.citation || "Lorem ipsum dolor"}</h3>
      </div>
      {/*Key findings */}
      <h2>Key Findings</h2>
      <div className="bg-gray-300 border-1 border-gray-400 p-4 rounded-2xl">
        <h3>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ratione
          voluptatem sit a repellendus natus explicabo molestiae minus veritatis
          cupiditate velit.
        </h3>
      </div>

      <h2>Generated Summary</h2>
      <div className="bg-gray-300 border-1 border-gray-400 p-4 rounded-2xl">
        <h3>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Accusamus ea
          ut saepe quidem ab dignissimos earum! Iste totam error ab libero
          impedit officiis saepe facilis quis aliquid qui commodi veniam, sed
          adipisci. Accusamus ducimus quis est quidem optio animi eos iste eius,
          repudiandae iusto reiciendis hic excepturi harum maxime inventore.
        </h3>
      </div>

      <h2>Related Studies</h2>
      <div className="h-50 flex flex-col gap-1">
        <div className="bg-gray-300 border-1 border-gray-400 p-4 rounded-2xl">
          <h1 className="text-lg font-bold">Immune System Effect</h1>
          <h2 className="text-lg ">Pranish et el . 2021</h2>
        </div>
        <div className="bg-gray-300 border-1 border-gray-400 p-4 rounded-2xl">
          <h1 className="text-lg font-bold">Immune System Effect</h1>
          <h2 className="text-lg ">Pranish et el . 2021</h2>
        </div>
      </div>
    </div>
  );
};

export default PublicationsView;
