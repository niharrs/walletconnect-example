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
  const [sessions, setSessions] = useState([]);
  const [accounts, setAccounts] = useState([]);

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

      const { uri, approval } = await signClient.connect({
        requiredNamespaces: proposalNamespace,
      });

      if (uri) {
        web3modal.openModal({ uri });
        const sessionNamespace = await approval();
        onSessionConnect(sessionNamespace);
        web3modal.closeModal();
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function onSessionConnect(session) {
    if (!session) throw Error("Session doesn't exist");
    try {
      setSessions(session);
      setAccounts(session.namespaces.eip155.accounts[0].slice(9));
    } catch (e) {
      console.log(e);
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
      {accounts.length ? (
        <p>{accounts}</p>
      ) : (
        <button onClick={handleConnect} disabled={!signClient}>
          Connect
        </button>
      )}
    </div>
  );
}

export default App;
