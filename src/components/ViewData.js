import React from "react";
import { Tabs } from "antd";
import CKEditor from 'ckeditor4-react';

const { TabPane } = Tabs;

const ViewData = ({ data }) => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Your document" key="1">
        <CKEditor
          type="classic"
          disabled={true}
          config={{ placeholder: "Type the content here!", isReadOnly: true }}
          data={data.decryptString}
          readOnly={true}
        />
      </TabPane>
    </Tabs>
  );
};

export default ViewData;
