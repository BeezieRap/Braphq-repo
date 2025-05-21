import React from "react";

const roadmapData = [
  {
    phase: "Phase 1 — Core Foundation 🐝",
    description:
      "Build the essential infrastructure for the $BRAPTKN ecosystem, including deploying the $BRAPTKN token, launching initial NFT collections, deploying staking contracts, and setting up core supporting contracts.",
  },
  {
    phase: "Phase 2 — App & Metadata Setup 🛠️",
    description:
      "Develop the $BRAPTKN HQ dApp with NFT and token metadata integration, enabling seamless user interaction with all deployed contracts. Complete thorough testing of all key user workflows.",
  },
  {
    phase: "Phase 3 — Launch & Marketing 🚀",
    description:
      "Officially launch the $BRAPTKN HQ dApp and market the first NFT collection and $BRAPTKN token. Focus on community building and collect feedback to refine the platform.",
  },
  {
    phase: "Phase 4 — Music NFT Release 🎵",
    description:
      "Expand the ecosystem with the release of the $BRAPTKN Music NFBz audio NFT collection, integrating music NFTs into staking and reward programs, and attract new audiences through unique content.",
  },
  {
    phase: "Phase 5 — Community & Token Growth 💨",
    description:
      "Implement strategies to grow community engagement and strengthen $BRAPTKN token value. Add a dedicated ‘Buy $BRAPTKN Token’ page within the marketplace for seamless token acquisition. Support liquidity growth and cross-community partnerships.",
  },
  {
    phase: "Phase 6 — Badge System & Rewards 🏅",
    description:
      "Launch an exclusive badge system that rewards active community members with access to raffles, airdrops, gated content, and offline events. Fully integrate badges into the $BRAPTKN HQ dApp for intuitive management.",
  },
];

const Roadmap = () => {
  return (
    <div style={{ backgroundColor: "#fff", color: "#111", width: "100%", padding: "2rem 0" }}>
      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "0 1rem" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: "#FFA500",
            marginBottom: "2rem",
          }}
        >
          BRAP Ecosystem Roadmap
        </h2>

        {roadmapData.map((item, index) => (
          <div
            key={index}
            style={{
              marginBottom: "2rem",
              paddingLeft: "1rem",
              borderLeft: "4px solid #FFA500",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              {item.phase}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roadmap;
