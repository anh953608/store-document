import React from "react";
import { Tabs } from "antd";
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
const { TabPane } = Tabs;

const ViewData = ({ data }) => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Your document" key="1">
        <CKEditor
          editor={ClassicEditor}
          disabled={true}
          config={{ placeholder: "Type the content here!", isReadOnly: true }}
          data={data.decryptString}
        />
      </TabPane>
    </Tabs>
  );
};

export default ViewData;
