import React, {Component} from "react";
import {Form, Input, Button} from 'antd';
import "./FormComponent.less";

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
              span: 24,
  },
};

export default class FormComponent extends Component {

  onFinish(values) {
    console.log('Success:', values);
  };

  onFinishFailed(errorInfo) {
    console.log('Failed:', errorInfo);
  };

  render() {
    return (
      <div className={"login-form"}>
        <Form
          {...layout}
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={() => this.onFinish}
          onFinishFailed={() => this.onFinishFailed}
        >
          <div className={"login-form-title"}>用户登录注册</div>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: 'Please input your username!',
              },
            ]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: 'Please input your password!',
              },
            ]}
          >
            <Input.Password/>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
            <Button type="primary" htmlType="submit">
              注册
            </Button>
          </Form.Item>
        </Form>
      </div>

    );
  }
}
