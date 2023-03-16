import { useEffect, useState } from "react";
import { SignClient } from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";
import "./App.css";

const web3modal = new Web3Modal({
  projectId: process.env.REACT_APP_PROJECT_ID,
  standaloneChains: ["eip155:5"],
});

function App() {
  const [signClient, setSignClient] = useState();

  async function createClient() {
    try {
      const client = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID,
      });
      setSignClient(client);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleConnect() {
    if (!signClient) throw Error("Cannot connect. Sign client not created.");
    try {
      const proposalNamespace = {
        eip155: {
          chains: ["eip155:5"],
          methods: ["eth_sendTransaction"],
          events: ["connect", "disconnect"],
        },
      };

      const { uri } = await signClient.connect({
        requiredNamespaces: proposalNamespace,
      });

      if (uri) {
        web3modal.openModal({
          uri,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (!signClient) {
      createClient();
    }
  }, [signClient]);

  return (
    <div className="App">
      <h1>Debugging paymaster</h1>
      <button onClick={handleConnect} disabled={!signClient}>
        Connect
      </button>
    </div>
  );
}

export default App;
