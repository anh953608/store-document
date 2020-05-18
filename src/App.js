import React from "react";
import Arweave from "arweave/web";
import axios from "axios";
import { Decimal } from "decimal.js";
import {
  createTransaction,
  signAndDeployTransaction,
  getAddressAndBalance,
  openNotificationWithIcon,
  getTransactionIds,
  getTransaction,
} from "./utils/arweaveUtils";
import CryptoJS from "crypto-js";
import jwkToPem from "jwk-to-pem";

import LoadWallet from "./components/LoadWallet";
import ConfirmTxModal from "./components/ConfirmTxModal";
import WalletHome from "./components/WalletHome";
import ViewData from "./components/ViewData";

import { Layout, Spin, Card, Modal, Button } from "antd";
import "./App.css";
import { LoadingOutlined } from "@ant-design/icons";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { Header, Content } = Layout;

const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  timeout: 20000,
  logging: false,
});

class App extends React.Component {
  state = {
    loading: false,
    loadWallet: false,
    walletData: "",
    number: "",
    creatingTx: false,
    arwAddress: "",
    arwBalance: 0,
    arValue: 0,
    arReceiverAddress: "",
    txSendArray: [],
    transactionData: "",
    modalTx: false,

    loadingNumber: true,

    totalTransfer: 0,
    newBalance: 0,
    valueTab: 0,
    txFee: 0,
    emptyData: false,
    loadWalletData: "",
    data: "",
  };

  change = (data) => {
    if (data === "") {
      this.setState({ emptyData: true }, () => {
        openNotificationWithIcon(
          "error",
          "Error",
          "Please input the document!"
        );
      });
    } else {
      this.setState({
        emptyData: false,
        data,
      });
    }
  };

  handleCloseTxModal = () => this.setState({ modalTx: false });

  handleFileUpload = async (e, nameEvent) => {
    const rawWallet = await this.readWallet(e.target.files[0]);
    this.setState({ [nameEvent]: rawWallet });
  };

  readWallet = (walletFile) => {
    const readAsDataURL = (walletFile) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          reader.abort();
          reject();
        };
        reader.addEventListener(
          "load",
          () => {
            resolve(reader.result);
          },
          false
        );
        reader.readAsText(walletFile);
      });
    };
    return readAsDataURL(walletFile);
  };

  async componentDidMount() {}

  confirmLoadWallet = async () => {
    try {
      this.setState({ loading: true });
      const walletData = this.state.loadWalletData;
      let walletObj = JSON.parse(walletData);
      const { address, balance } = await getAddressAndBalance(walletObj);

      const txids = await getTransactionIds("from", address);
      const jsonDatas = await Promise.all(
        await txids.map(async (txid) => {
          const res = await axios.get(`https://arweave.net/tx/${txid}/data`);
          const transactionData = await getTransaction(txid);
          transactionData.data = res.data;
          const data = transactionData.get("data", {
            decode: true,
            string: true,
          });
          const pvKey = await jwkToPem(walletObj, { private: true });
          const decrypt = await CryptoJS.AES.decrypt(data, pvKey);
          const decryptString = await decrypt.toString(CryptoJS.enc.Utf8);
          return { ...transactionData, decryptString, view: false };
        })
      );
      this.setState({
        loading: false,
        loadWallet: true,
        walletData: walletObj,
        arwAddress: address,
        arwBalance: balance,
        loadWalletData: "",
        txSendArray: jsonDatas,
      });
    } catch (err) {
      this.setState({ loading: false });
      openNotificationWithIcon(
        "error",
        "Error",
        "Something wrong, check your file key"
      );
    }
  };

  saveData = async () => {
    try {
      this.setState({ creatingTx: true });
      const { arwBalance, walletData, data } = this.state;
      const pvKey = await jwkToPem(walletData, { private: true });
      const dataEncrypted = await CryptoJS.AES.encrypt(data, pvKey);
      const dataEncryptedString = await dataEncrypted.toString();
      let transaction = await createTransaction(
        walletData,
        dataEncryptedString
      );
      transaction.addTag("appname", `save-secret-text`);
      let fee = arweave.ar.winstonToAr(transaction.reward);

      let result = await Decimal.add(fee, 0).valueOf();
      let newBalance = await Decimal.sub(arwBalance, result).valueOf();
      if (newBalance < 0) {
        this.setState({ creatingTx: false }, () => {
          openNotificationWithIcon(
            "error",
            "Error",
            "Insufficient founds, you much have 0.1 AR to buy."
          );
        });
        return;
      }
      this.setState({
        transactionData: transaction,
        modalTx: true,
        totalTransfer: result,
        txFee: fee,
        newBalance,
        creatingTx: false,
        cryptoTxPass: "",
      });
    } catch (err) {
      console.log(err);
      this.setState({ creatingTx: false }, () => {
        openNotificationWithIcon(
          "error",
          "Error",
          "Something wrong, please try again!"
        );
      });
    }
  };

  confirmTransferCrypto = async () => {
    try {
      this.setState({ txRunning: true });
      let walletData = this.state.walletData;
      let txArray = this.state.txSendArray;
      let transaction = this.state.transactionData;

      const { arValue, arwBalance, data } = this.state;
      const response = await signAndDeployTransaction(transaction, walletData);
      if (response.data === "OK" && response.status === 200) {
        const obj = {
          decryptString: data,
        };
        txArray.push(obj);
        const newBalance = await Decimal.sub(arwBalance, arValue).valueOf();
        this.setState({
          cryptoTxPass: "",
          txSendArray: txArray,
          arValue: 0,
          arReceiverAddress: "",
          txRunning: false,
          arwBalance: newBalance,
          modalTx: false,
        });
        walletData = "";
        openNotificationWithIcon(
          "success",
          "Success",
          "Transaction Deploy Successfully"
        );
        return;
      }
      openNotificationWithIcon("error", "Error", "Transaction Failed");
      walletData = "";
      this.setState({ txRunning: false, cryptoTxPass: "" });
    } catch (err) {
      openNotificationWithIcon("error", "Error", "Transaction Failed");
      this.setState({ txRunning: false, cryptoTxPass: "" });
    }
  };

  walletDiv = () => {
    const { loadWallet, txSendArray, modalTx, txRunning } = this.state;
    if (!loadWallet) {
      return (
        <Card style={{ width: "100%" }} bordered hoverable={true}>
          <LoadWallet
            handleWalletUpload={this.handleFileUpload}
            confirmLoadWallet={this.confirmLoadWallet}
          />
        </Card>
      );
    } else {
      return (
        <div>
          <Card
            style={{
              width: "100%",
              marginBottom: "20px",
              borderColor: "black",
            }}
            bordered
            size="large"
            hoverable={true}
          >
            <WalletHome
              change={this.change}
              state={this.state}
              saveData={this.saveData}
            />
          </Card>
          {txSendArray &&
            txSendArray.length > 0 &&
            txSendArray.map((item, index) => {
              return (
                <React.Fragment>
                  <strong style={{ fontSize: "large" }}>
                    Your document in Arweave blockchain:{" "}
                  </strong>
                  <Card
                    hoverable={true}
                    style={{ width: "100%", marginTop: "20px" }}
                    size="large"
                    key={index}
                  >
                    <ViewData data={item} />
                  </Card>
                </React.Fragment>
              );
            })}
          <Modal
            title="Confirm Dialog"
            onCancel={this.handleCloseTxModal}
            visible={modalTx}
            footer={[
              <Button
                danger
                key="back"
                shape="round"
                onClick={this.handleCloseTxModal}
              >
                No
              </Button>,
              <Button
                key="submit"
                shape="round"
                loading={txRunning}
                onClick={this.confirmTransferCrypto}
              >
                Yes
              </Button>,
            ]}
          >
            <ConfirmTxModal />
          </Modal>
        </div>
      );
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <Layout className="layout">
        <Header className="header">Arweave Store Secret Document</Header>
        <Content
          style={{
            margin: "30px 30% auto",
            minHeight: "calc(100vh - 94px)",
            overflow: "initial",
          }}
        >
          <Spin spinning={loading} delay={500} indicator={antIcon} size="large">
            {this.walletDiv()}
          </Spin>
        </Content>
      </Layout>
    );
  }
}

export default App;
