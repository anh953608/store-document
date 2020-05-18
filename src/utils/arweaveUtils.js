import Arweave from "arweave/web";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description,
  });
};

const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  timeout: 20000,
  logging: false,
});

const createTransaction = async (walletData, data) => {
  let transaction = await arweave.createTransaction({ data }, walletData);
  return transaction;
};

const signAndDeployTransaction = async (transaction, walletData) => {
  await arweave.transactions.sign(transaction, walletData);
  const response = await arweave.transactions.post(transaction);
  return response;
};

const getAddressAndBalance = async (walletData) => {
  const address = await arweave.wallets.jwkToAddress(walletData);
  const rawBalance = await arweave.wallets.getBalance(address);
  const balance = await arweave.ar.winstonToAr(rawBalance);
  return { address, balance };
};

const getTransactionIds = async (option, address) => {
  const txids = await arweave.arql({
    op: "and",
    expr1: {
      op: "equals",
      expr1: option,
      expr2: address,
    },
    expr2: {
      op: "equals",
      expr1: "appname",
      expr2: `save-secret-text`,
    },
  });
  return txids;
};

const getTransaction = async (transactionId) => {
  const transaction = await arweave.transactions.get(transactionId);
  return transaction;
};
export {
  createTransaction,
  signAndDeployTransaction,
  getAddressAndBalance,
  openNotificationWithIcon,
  getTransactionIds,
  getTransaction,
};
