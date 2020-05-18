import React from "react";
import { Tabs } from "antd";
import { Button } from "antd";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
          editor={ClassicEditor}
          config={{ placeholder: "Type the document here!" }}
          onChange={(event, editor) => {
            const data = editor.getData();
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
