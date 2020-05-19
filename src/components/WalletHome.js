import React from "react";
import { Tabs } from "antd";
import { Button } from "antd";
import CKEditor from "ckeditor4-react";
const { TabPane } = Tabs;

const WalletHome = ({ state, change, saveData }) => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane
        tab="Secret your document"
        key="1"
        style={{ alignItems: "20px" }}
      >
        <p>Input your document:</p>
        <CKEditor
          type="classic"
          config={{ placeholder: "Type the document here!" }}
          onChange={(event) => {
            const data = event.editor.getData();
            change(data);
          }}
        />
        <Button
          disabled={!state.data || state.emptyData}
          style={{ marginTop: "20px" }}
          shape="round"
          onClick={saveData}
          htmlType="submit"
          loading={state.creatingTx}
        >
          SAVE TO BLOCKCHAIN
        </Button>
      </TabPane>
    </Tabs>
  );
};

export default WalletHome;
