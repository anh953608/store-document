import React from "react";
import { Card, Button } from "antd";

const LoadWallet = ({ handleWalletUpload, confirmLoadWallet }) => {
  return (
    <Card
      style={{ width: '100%' , textAlign: 'center'}}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <input
        style={{ paddingBottom: 20 }}
        type="file"
        accept=".json"
        onChange={(e) => {
          handleWalletUpload(e, "loadWalletData");
        }}
      />
      <Button
        onClick={confirmLoadWallet}
        shape="round"
        size={"large"}
      >
        Import
      </Button>
    </Card>
  );
};

export default LoadWallet;
